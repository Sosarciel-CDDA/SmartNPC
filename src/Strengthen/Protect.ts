import { DataManager } from "@sosarciel-cdda/event";
import { Effect, Eoc, JM, listCtor, Mutation, Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SNDef } from "../Define";
import { EOC_FULL_RECIVERY } from "@/src/Common";

const IslandModId = "skyisland";
const IslandModOrigLocId = 'OM_HQ_origin';

const UID = "ProtectNpc";

/**出生点ID */
export const SPAWN_LOC_ID = `${UID}_SpawnLoc`;

/**保护标志 */
const ProtectMut: Mutation = {
    id: SNDef.genMutationID(UID),
    name: "被保护的",
    purifiable: false,
    valid: false,
    player_display: true,
    points: 0,
    type: "mutation",
    description: "在死亡时将会被传送至重生点",
};


/**复活虚弱 */
const Weak:Effect={
    type:"effect_type",
    id:SNDef.genEffectID(`${UID}_DeathRebirth_Weak`),
    name:["复活虚弱"],
    desc:["刚刚经历复活, 处于虚弱状态 四维属性与速度 -50%, 且无法被召集"],
    enchantments:[{
        condition:'ALWAYS',
        values:[
            { value:'STRENGTH'    , multiply:-0.5 },
            { value:'DEXTERITY'   , multiply:-0.5 },
            { value:'PERCEPTION'  , multiply:-0.5 },
            { value:'INTELLIGENCE', multiply:-0.5 },
            { value:'SPEED'       , multiply:-0.5 },
        ],
    }]
}

const npclist = listCtor({
    id:`${UID}_NpcList`,
    prop:['Talker'] as const
});

const talkerPtr  = `${UID}_TalkerPtr`;
const isVaildPtr = `${UID}_IsVaildPtr`;
//npc注册的索引
const inListIdx  = `${UID}_InListIdx`;

//npc保护
export async function buildProtect(dm:DataManager){

    //#region 召集
    //传送到出生点
    const teleportToSpawn:Eoc = {
        type:"effect_on_condition",
        eoc_type:'ACTIVATION',
        id:SNDef.genEocID(`${UID}_TeleportToSpawn`),
        effect: [
            {if:{mod_is_loaded:IslandModId},
            then:[{set_string_var:IslandModOrigLocId,target_var:{context_val:'tmplocptr'}}],
            else:[{set_string_var:SPAWN_LOC_ID      ,target_var:{context_val:'tmplocptr'}}]},

            {u_teleport:{var_val:'tmplocptr'},force_safe:true},
        ]
    }

    //传送到目标
    const TeleportPos = `${UID}_TeleportPos`;
    const teleportToPos:Eoc = {
        type:"effect_on_condition",
        eoc_type:'ACTIVATION',
        id:SNDef.genEocID(`${UID}_TeleportPos`),
        effect: [{u_teleport:{global_val:TeleportPos},force_safe:true}]
    };

    //召集法术
    const GatherNpcEoc:Eoc = npclist.genEachVaildEoc(SNDef.genEocID(`${UID}_GatherNpc`),[
        npclist.setEachIdxPtr('Talker',{context_val:talkerPtr}),
        {u_location_variable:{global_val:TeleportPos}},
        {run_eocs:{
            id:SNDef.genEocID(`${UID}_GatherNpc_Sub`),
            eoc_type:"ACTIVATION",
            effect:[{if:{and:[
                "u_is_npc",{not:{u_has_effect:Weak.id}}
            ]},then:[
                {run_eocs:[teleportToPos.id]}
            ]}]
        }, alpha_talker:{var_val:talkerPtr}},
    ]);
    const GatherNpcSpell:Spell = {
        id:SNDef.genSpellID(`${UID}_GatherNpc`),
        name:"召集",
        description:"召集所有npc到你身边",
        type:'SPELL',
        effect:'effect_on_condition',
        effect_str:GatherNpcEoc.id,
        valid_targets:['self'],
        shape:'blast',
        teachable:false,
        flags:[...CON_SPELL_FLAG],
    }


    //召回法术
    const RecallNpcEoc:Eoc = npclist.genEachVaildEoc(SNDef.genEocID(`${UID}_RecallNpc`),[
        npclist.setEachIdxPtr('Talker',{context_val:talkerPtr}),
        {run_eocs:{
            id:SNDef.genEocID(`${UID}_RecallNpc_Sub`),
            eoc_type:"ACTIVATION",
            effect:[{if:"u_is_npc",then:[{run_eocs:[teleportToSpawn.id]}]}]
        }, alpha_talker:{var_val:talkerPtr}},
    ]);
    const RecallNpcSpell:Spell = {
        id:SNDef.genSpellID(`${UID}_RecallNpc`),
        name:"召回",
        description:"召回所有npc到出生点",
        type:'SPELL',
        effect:'effect_on_condition',
        effect_str:RecallNpcEoc.id,
        valid_targets:['self'],
        shape:'blast',
        teachable:false,
        flags:[...CON_SPELL_FLAG],
    }
    //#endregion 传送到出生点

    //死亡保护
    const RebirthEoc:Eoc=SNDef.genActEoc(`${UID}_DeathRebirth`,[
        {u_add_effect:Weak.id,duration:'4 h'},
        {run_eocs:[EOC_FULL_RECIVERY,teleportToSpawn.id]},
        {if:"u_is_npc",then:[ {math:[JM.npcTrust('u'),'=','100']} ]},
    ],{or:[
        {u_has_trait:ProtectMut.id},
        'u_is_avatar',
    ]});
    dm.addInvokeID('DeathPrev',-100,RebirthEoc.id);


    //出生点设置
    const SetSpawnLocEoc:Eoc=SNDef.genActEoc(`${UID}_SpawnLocSet`,[
        {u_location_variable:{global_val:SPAWN_LOC_ID}},
    ]);
    dm.addInvokeID('GameStart',0,SetSpawnLocEoc.id);

    //初始化
    const init:Eoc = {
        id:SNDef.genEocID(`${UID}_Init`),
        eoc_type:"ACTIVATION",
        type:"effect_on_condition",
        effect:[
            {math:[JM.spellLevel('u',`'${GatherNpcSpell.id}'`),'=','0']},
            {math:[JM.spellLevel('u',`'${RecallNpcSpell.id}'`),'=','0']},
        ]
    }
    dm.addInvokeID("GameBegin",0,init.id);

    //#region 开关
    //启用保护
    const StartProtectEoc:Eoc = npclist.genFirstUnvaildEoc(SNDef.genEocID(`${UID}_StartProtect`),[
        {u_add_trait:ProtectMut.id},
        {math:[`u_${inListIdx}`,'=',npclist.eachIdx]},
        npclist.setEachIdxPtr('Talker',{context_val:talkerPtr}),
        {u_set_talker: { var_val: talkerPtr } },
        npclist.setEachIdxPtr('IsVaild',{context_val:isVaildPtr}),
        {math:[`v_${isVaildPtr}`,'=','1']},
    ]);
    //关闭保护
    const StopProtectEoc:Eoc = {
        id:SNDef.genEocID(`${UID}_StopProtect`),
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[
            {u_lose_trait:ProtectMut.id},
            {set_string_var:npclist.where(`<u_val:${inListIdx}>`).IsVaild,
                target_var:{context_val:isVaildPtr},parse_tags:true},
            {math:[`v_${isVaildPtr}`,'=','0']},
        ]
    }
    //对话
    const talkTopic:TalkTopic={
        type:"talk_topic",
        id:["TALK_ALLY_ORDERS"],
        insert_before_standard_exits:true,
        responses:[{
            text:`在这里设置重生点 当前:<global_val:${SPAWN_LOC_ID}>`,
            effect:{run_eocs:[SetSpawnLocEoc.id]},
            topic:"TALK_DONE",
            condition:{not:{mod_is_loaded:IslandModId}}
        },{
            truefalsetext:{
                true:"[已启用] 切换重生点使用状态",
                false:"[已停用] 切换重生点使用状态",
                condition:{npc_has_trait:ProtectMut.id},
            },
            effect:{run_eocs:{
                id:SNDef.genEocID(`${UID}_ToggleProtect`),
                eoc_type:"ACTIVATION",
                effect:[{
                    if:{u_has_trait:ProtectMut.id},
                    then:[{run_eocs:[StopProtectEoc.id]}],
                    else:[{run_eocs:[StartProtectEoc.id]}]
                }]
            },alpha_talker:'npc'},
            topic:"TALK_DONE",
        }]
    }
    //#endregion

    dm.addData([
        ProtectMut,Weak,
        teleportToSpawn,teleportToPos,RebirthEoc,
        SetSpawnLocEoc,StartProtectEoc,StopProtectEoc,talkTopic,
        GatherNpcEoc,GatherNpcSpell,
        RecallNpcEoc,RecallNpcSpell,
        init,
    ],'Strength','Protect.json');
}