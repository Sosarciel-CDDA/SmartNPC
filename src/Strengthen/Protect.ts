import { DataManager } from "@sosarciel-cdda/event";
import { Eoc, JM, Mutation, Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SADef } from "../Define";
import { EOC_FULL_RECIVERY } from "@/src/Common";
import { listCtor } from "../Utils";

const IslandModId = "skyisland";
const IslandModOrigLocId = 'OM_HQ_origin';

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
    const TeleportDone = `${UID}_TeleportDone`;
    const TeleportPos = `${UID}_TeleportPos`;
    const teleportToSpawn:Eoc = {
        type:"effect_on_condition",
        eoc_type:'ACTIVATION',
        id:SADef.genEocID(`${UID}_TeleportToSpawn`),
        effect: [
            {math:[TeleportDone,'=','0']},
            {if:{mod_is_loaded:IslandModId},
            then:[{set_string_var:IslandModOrigLocId,target_var:{context_val:'tmplocptr'}}],
            else:[{set_string_var:SPAWN_LOC_ID      ,target_var:{context_val:'tmplocptr'}}]},

            {u_teleport:{var_val:'tmplocptr'},force_safe:true},
        ]
    }

    //召集法术
    const GatheringEoc:Eoc = npclist.genEachVaildEoc(SADef.genEocID(`${UID}_Gathering`),[
        {set_string_var:npclist.where(`<global_val:${npclist.eachIdx}>`).Talker,
            target_var:{context_val:talkerPtr},parse_tags:true},
        {run_eocs:{
            id:SADef.genEocID(`${UID}_Gathering_Sub`),
            eoc_type:"ACTIVATION",
            effect:[ {run_eocs:[teleportToSpawn.id]} ]
        }, alpha_talker:{var_val:talkerPtr}},
    ]);
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
    //#endregion 传送到出生点

    //死亡保护
    const RebirthEoc:Eoc=SADef.genActEoc(`${UID}_DeathRebirth`,[
        {run_eocs:[EOC_FULL_RECIVERY,teleportToSpawn.id]},
        {if:"u_is_npc",then:[
            {math:[JM.npcTrust('u'),'=','100']},
            "follow",
        ]},
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

    //初始化
    const init:Eoc = {
        id:SADef.genEocID(`${UID}_Init`),
        eoc_type:"ACTIVATION",
        type:"effect_on_condition",
        effect:[
            {math:[JM.spellLevel('u',`'${GatheringSpell.id}'`),'=','0']}
        ]
    }
    dm.addInvokeID("GameBegin",0,init.id);

    //#region 开关
    //启用保护
    const StartProtectEoc:Eoc = npclist.genFirstUnvaildEoc(SADef.genEocID(`${UID}_StartProtect`),[
        {u_add_trait:ProtectMut.id},
        {math:[`u_${inListIdx}`,'=',npclist.eachIdx]},
        {set_string_var:npclist.where(`<global_val:${npclist.length}>`).Talker,
            target_var:{context_val:talkerPtr},parse_tags:true},
        {u_set_talker: { var_val: talkerPtr } },
        {set_string_var:npclist.where(`<global_val:${npclist.length}>`).IsVaild,
            target_var:{context_val:isVaildPtr},parse_tags:true},
        {math:[`v_${isVaildPtr}`,'=','1']},
    ]);
    //关闭保护
    const StopProtectEoc:Eoc = {
        id:SADef.genEocID(`${UID}_StopProtect`),
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[
            {u_lose_trait:ProtectMut.id},
            {set_string_var:npclist.where(`<u_val:${inListIdx}>`).IsVaild,
                target_var:{context_val:isVaildPtr},parse_tags:true},
            {math:[`v_${isVaildPtr}`,'=','0']},
        ]
    }
    //战斗对话
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
                id:SADef.genEocID(`${UID}_ToggleProtect`),
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
        ProtectMut,
        teleportToSpawn,RebirthEoc,
        SetSpawnLocEoc,StartProtectEoc,StopProtectEoc,talkTopic,
        GatheringEoc,GatheringSpell,
        init,
    ],'Strength','Protect.json');
}