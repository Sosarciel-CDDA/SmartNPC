import { DataManager } from "@sosarciel-cdda/event";
import { Eoc, Mutation, Spell } from "@sosarciel-cdda/schema";
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

/**全局 NpcList 注册的数量 */
const pnpcCount = `${UID}_NpcList_RegCount`;
/**根据 编号 获得全局 NpcList 的成员变量 */
const pnpcId = (numstr:string)=>`${UID}_NpcList_Prop_${numstr}`;
const eachIdx  = `${UID}_NpcList_EachIndex`;

const charIdPtr = 'CharIdPtr'


/**生成遍历npc的eoc */
const eachCharEocInput = `${UID}_EachNpcList_InputEocId`;
const eachCharEoc:Eoc = {
    type:"effect_on_condition",
    id:SADef.genEocID(`${UID}_EachNpcList`),
    effect:[
        {math:[eachIdx,'=','0']},
        {
            run_eocs:{
                id:SADef.genEocID(`${UID}_EachNpcList_Until`),
                eoc_type:'ACTIVATION',
                effect:[
                    {u_message:`each <global_val:${eachIdx}>`},
                    {math:[eachIdx,'+=','1']},
                    {set_string_var:pnpcId(`<global_val:${eachIdx}>`),target_var:{context_val:charIdPtr},parse_tags:true},
                    {run_eocs:{global_val:eachCharEocInput}, alpha_talker:{var_val:charIdPtr}},
                ],
            },
            iterations: {math:[pnpcCount]}
            //condition:{ math:['_eachIndex','<=',UniqueNpcCountVarID] },
        }
    ]
}




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
        {math:[pnpcCount,'+=','1'] },
        {set_string_var:pnpcId(`<global_val:${pnpcCount}>`),target_var:{context_val:charIdPtr},parse_tags:true},
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

    dm.addData([
        ProtectMut,
        eachCharEoc,
        randTeleport,teleportToSpawn,RebirthEoc,
        SetSpawnLocEoc,InitNpcEoc,
        GatheringEoc,GatheringSubEoc,GatheringSpell,
    ],'Strength','Protect.json');
}