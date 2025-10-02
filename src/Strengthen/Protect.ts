import { DataManager } from "@sosarciel-cdda/event";
import { BoolExpr, Eoc, EocEffect, JM, Mutation, Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SADef } from "../Define";
import { EOC_FULL_RECIVERY } from "@/src/Common";



const UID = "ProtectNpc";

/**出生点ID */
export const SPAWN_LOC_ID = `${UID}_SpawnLoc`;

/**保护标志 */
const ProtectMut: Mutation = {
    id: SADef.genMutationID(UID),
    name: "被保护的",
    purifiable: false,
    valid: false,
    player_display: true,
    points: 0,
    type: "mutation",
    description: "在死亡时将会被传送至重生点",
};


const listCtor = <
    Id extends string,
    Prop extends readonly string[],
>(opt:{ id:Id; prop:Prop; })=>{
    const {prop,id} = opt;
    const length = `${id}_Length` as const;
    const eachIdx  = `${id}_EachIndex` as const;
    const isVaildPtr = `${id}_IsVaildPtr` as const;

    type FixedProp = [...Prop,"IsVaild"];
    const fixedProp = [...prop,"IsVaild"] as FixedProp;

    /**获取位于某位置的成员变量名 */
    const where = (numstr:string)=> fixedProp.reduce((acc,cur)=>
        ({...acc,[cur]:`${id}_${numstr}_${cur}`}),{}) as {
            [K in FixedProp[number]]:`${Id}_${number}_${K}`
        };

    /**生成一个遍历列表的eoc */
    const genEachEoc = (
        eid:string,effect:EocEffect[]
    )=>({
        type:"effect_on_condition",
        id:`${id}_Each_${eid}`,
        eoc_type:"ACTIVATION",
        effect:[
            {math:[eachIdx,'=','0']},
            {run_eocs:{
                id:`${id}_Each_${eid}_Until`,
                eoc_type:'ACTIVATION',
                effect:[
                    {math:[eachIdx,'+=','1']},
                    ...effect,
                ],
            }, iterations: {math:[length]}}
        ],
    }) satisfies Eoc;

    /**生成一个遍历列表有效部分的eoc */
    const genEachVaildEoc = (
        eid:string,effect:EocEffect[]
    )=>genEachEoc(eid,[
        {set_string_var:(where(`<global_val:${eachIdx}>`) as any).IsVaild,target_var:{context_val:isVaildPtr}},
        {if:{math:[`v_${isVaildPtr}`,'==','1']},then:effect}
    ]);

    const firstUnvaildDone = `${id}_firstUnvaild_Done` as const;
    /**生成一段在首个失效idx运行的eoc */
    const genFirstUnvaildEoc = (eid:string,effect:EocEffect[])=>({
        type:"effect_on_condition",
        id:`${id}_FirstUnvaild_${eid}`,
        eoc_type:"ACTIVATION",
        effect:[
            {math:[eachIdx,'=','0']},
            {math:[firstUnvaildDone,'=','0']},
            {run_eocs:{
                id:`${id}_FirstUnvaild_${eid}_Until`,
                eoc_type:'ACTIVATION',
                effect:[
                    {math:[eachIdx,'+=','1']},
                    {set_string_var:(where(`<global_val:${eachIdx}>`) as any).IsVaild,target_var:{context_val:isVaildPtr}},
                    {if:{math:[`v_${isVaildPtr}`,'!=','1']},then:[
                        ...effect,
                        {math:[firstUnvaildDone,'=','1']},
                    ]},
                ],
            },
            iterations: {math:[`${length}+1`]},
            condition:{math:[firstUnvaildDone,'!=','1']}}
        ],
    }) satisfies Eoc;

    return {
        length,eachIdx,where,genEachEoc,genEachVaildEoc,genFirstUnvaildEoc
    };
}

const pnpc = listCtor({
    id:`${UID}_NpcList`,
    prop:['Talker'] as const
});

const charIdPtr = 'CharIdPtr'
/**生成遍历npc的eoc */
const eachCharEocInput = `${UID}_EachNpcList_InputEocId`;
const eachCharEoc:Eoc = pnpc.genEachVaildEoc('EachTalker',[
    {set_string_var:pnpc.where(`<global_val:${pnpc.eachIdx}>`).Talker,target_var:{context_val:charIdPtr},parse_tags:true},
    {run_eocs:{global_val:eachCharEocInput}, alpha_talker:{var_val:charIdPtr}},
])

//npc保护
export async function buildProtect(dm:DataManager){

    //递归随机传送
    const randTeleportEocID = SADef.genEocID(`${UID}_RandTeleport`);
    const randTeleport:Eoc = {
        type:"effect_on_condition",
        eoc_type:'ACTIVATION',
        id:randTeleportEocID,
        effect:[
            {u_location_variable:{context_val:'tmploc'}},
            {location_variable_adjust:{context_val:'tmploc'},
                x_adjust: {math:['rand(2)-1']},
                y_adjust: {math:['rand(2)-1']}
            },
            {run_eocs:{
                id:`RandTeleport_runeocwithinline`,
                eoc_type:'ACTIVATION',
                effect:[ {if:'u_is_character',then:[{run_eocs:[randTeleportEocID]}]} ],
            }, alpha_loc:{context_val:'tmploc'} },
            {u_teleport:{context_val:'tmploc'},force:true},
        ],
    }

    //传送到出生点
    const teleportToSpawn:Eoc = {
        type:"effect_on_condition",
        eoc_type:'ACTIVATION',
        id:SADef.genEocID(`${UID}_TeleportToSpawn`),
        effect: [
            //尝试移走处于出生点的npc
            {run_eocs:{
                id:SADef.genEocID(`${UID}_TeleportToSpawn_Sub`),
                eoc_type:'ACTIVATION',
                effect:[ {if:'u_is_character',then:[{run_eocs:[randTeleport.id]}]} ],
            }, alpha_loc:{global_val:SPAWN_LOC_ID} },
            {u_teleport:{global_val:SPAWN_LOC_ID},force:true},
        ]
    }

    //死亡保护
    const RebirthEoc:Eoc=SADef.genActEoc(`${UID}_DeathRebirth`,[
        {run_eocs:[teleportToSpawn.id,EOC_FULL_RECIVERY]},
    ],{or:[
        {u_has_trait:ProtectMut.id},
        'u_is_avatar',
    ]});
    dm.addInvokeID('DeathPrev',-100,RebirthEoc.id);


    //出生点设置
    const SetSpawnLocEoc:Eoc=SADef.genActEoc(`${UID}_SpawnLocSet`,[
        {u_location_variable:{global_val:SPAWN_LOC_ID}},
    ]);
    dm.addInvokeID('GameStart',0,SetSpawnLocEoc.id);

    //初始化Npc
    const InitNpcEoc:Eoc = SADef.genActEoc(`${UID}_InitNpc`,[
        {u_add_trait:ProtectMut.id},
        {math:[pnpc.length,'+=','1'] },
        {set_string_var:pnpc.where(`<global_val:${pnpc.length}>`).Talker,target_var:{context_val:charIdPtr},parse_tags:true},
        {u_set_talker: { var_val: charIdPtr } },
    ]);

    //#region 召集npc法术
    const GatheringSubEoc:Eoc = {
        type:'effect_on_condition',
        id:SADef.genEocID(`${UID}_Gathering_Sub`),
        eoc_type:"ACTIVATION",
        effect:[ {run_eocs:[teleportToSpawn.id]} ]
    }
    const GatheringEoc:Eoc = {
        type:'effect_on_condition',
        id:SADef.genEocID(`${UID}_Gathering`),
        eoc_type:"ACTIVATION",
        effect:[
            {set_string_var:GatheringSubEoc.id,target_var:{global_val:eachCharEocInput}},
            {run_eocs:[eachCharEoc.id]},
        ]
    }
    const GatheringSpell:Spell = {
        id:SADef.genSpellID(`${UID}_Gathering`),
        name:"召集",
        description:"召集所有npc回到出生点",
        type:'SPELL',
        effect:'effect_on_condition',
        effect_str:GatheringEoc.id,
        valid_targets:['self'],
        shape:'blast',
        flags:[...CON_SPELL_FLAG],
    }
    //#endregion
    //初始化
    const init:Eoc = {
        id:SADef.genEocID(`${UID}_Init`),
        eoc_type:"ACTIVATION",
        type:"effect_on_condition",
        effect:[
            {math:[JM.spellLevel('u',GatheringSpell.id),'=','0']}
        ]
    }
    dm.addInvokeID("GameBegin",0,init.id);

    //战斗对话
    const talkTopic:TalkTopic={
        type:"talk_topic",
        id:["TALK_LUO_ORDERS"],
        insert_before_standard_exits:true,
        responses:[{
            text:`在这里设置重生点 当前:<global_val${SPAWN_LOC_ID}>`,
            effect:{run_eocs:[SetSpawnLocEoc.id]},
            topic:"TALK_LUO_ORDERS",
        },{
            truefalsetext:{
                true:"[已启用] 切换重生点使用状态",
                false:"[已停用] 切换重生点使用状态",
                condition:{u_has_trait:ProtectMut.id},
            },
            effect:{
                if:{u_has_trait:ProtectMut.id},
                then:[{u_lose_trait:ProtectMut.id}],
                else:[{u_add_trait:ProtectMut.id}]
            },
            topic:"TALK_LUO_ORDERS",
        }]
    }

    dm.addData([
        ProtectMut,
        eachCharEoc,
        randTeleport,teleportToSpawn,RebirthEoc,
        SetSpawnLocEoc,InitNpcEoc,talkTopic,
        GatheringEoc,GatheringSubEoc,GatheringSpell,
        init,
    ],'Strength','Protect.json');
}