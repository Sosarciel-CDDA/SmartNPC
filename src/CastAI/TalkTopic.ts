import { DataManager } from "@sosarciel-cdda/event";
import { ControlCastResps, ControlCastSpeakerEffects } from "./ProcFunc";
import { Resp, TalkTopic } from "@sosarciel-cdda/schema";
import { CombatRuleTopicID, SNDef, getSpellByID } from "@/src/Define";
import { CastAIDataMap, CoCooldownName, CoSwitchDisableName } from "./CastAI";
import { CastAIData } from "./Interface";
import { getEnableSpellVar, nv, uv } from "./UtilFunc";



const displayManaName = SNDef.genVarID(`DisplayMana`);

export async function createCastAITalkTopic(dm:DataManager){
    //对话EOC
    const TalkEoc = SNDef.genActEoc('CastControlTopicEffect',[
        {run_eocs:{
            id:`CastControlTopicEffect_Rev`,
            eoc_type:"ACTIVATION",
            effect:[...ControlCastSpeakerEffects],
        },alpha_talker:"npc",beta_talker:"u"},
        {math:[nv(displayManaName),"=","n_val('mana')"]}
    ]);
    //主对话
    const mainTalkTopic:TalkTopic={
        type:"talk_topic",
        id:["TALK_FRIEND","TALK_FRIEND_GUARD"],
        insert_before_standard_exits:true,
        responses:[{
            text : "[战斗]我想给你一些作战指令。",
            topic: CombatRuleTopicID,
        },{
            text : "[施法]我想让你释放法术。",
            topic: await createCastControlResp(dm),
            effect:{run_eocs:TalkEoc.id}
        }]
    }
    //战斗对话
    const combatTalkTopic:TalkTopic={
        type:"talk_topic",
        id:[CombatRuleTopicID],
        insert_before_standard_exits:true,
        responses:[{
            text : "改一下你的施法方式吧……",
            topic: await createSkillResp(dm)
        }]
    }
    dm.addData([TalkEoc,mainTalkTopic,combatTalkTopic],"CastAI",'TalkTopic');
}

/**创建施法对话 */
async function createCastControlResp(dm:DataManager){
    //主对话id
    const castControlTalkTopicId = SNDef.genTalkTopicID(`CastControl`);
    //施法主对话
    const castControlTalkTopic:TalkTopic={
        type:"talk_topic",
        id:castControlTalkTopicId,
        dynamic_line:`&当前魔法值: <npc_val:${displayManaName}> 公共冷却: <npc_val:${CoCooldownName}>`,
        responses:[...ControlCastResps,{
            text: "Never mind.",
            topic: "TALK_NONE"
        }]
    }
    dm.addData([castControlTalkTopic],"CastAI",'Castcontrol_TalkTopic');
    return castControlTalkTopicId;
}


/**创建技能对话 */
async function createSkillResp(dm:DataManager){
    //主对话id
    const skillTalkTopicId = SNDef.genTalkTopicID(`CastSwitch`);

    const skills = (Object.values(CastAIDataMap) as CastAIData[]);

    //遍历技能
    const skillRespList:Resp[] = [];
    for(const skill of skills){
        const {id} = skill;
        const spell = getSpellByID(id);
        const name = `<spell_name:${id}>`;

        const nEnableVar = nv(getEnableSpellVar(spell));

        //开关对话
        const resp:Resp={
            condition:{math:[`n_spell_level('${spell.id}')`,">=","0"]},
            truefalsetext:{
                condition:{math:[nEnableVar,"==","1"]},
                true:`[已启用] ${name}`,
                false:`[已停用] ${name}`,
            },
            effect:{
                if:{math:[nEnableVar,"==","1"]},
                then:[{math:[nEnableVar,"=","0"]}],
                else:[{math:[nEnableVar,"=","1"]}],
            },
            topic:skillTalkTopicId,
        }
        skillRespList.push(resp);
    }

    //技能主对话
    const skillTalkTopic:TalkTopic={
        type:"talk_topic",
        id:skillTalkTopicId,
        dynamic_line:"&<mypronoun>应该做些什么？",
        responses:[{
            truefalsetext:{
                condition:{math:[nv(CoSwitchDisableName),"==","1"]},
                true:`[已停止自动施法]`,
                false:`[已开启自动施法]`,
            },
            effect:{
                if:{math:[nv(CoSwitchDisableName),"==","1"]},
                then:[{math:[nv(CoSwitchDisableName),"=","0"]}],
                else:[{math:[nv(CoSwitchDisableName),"=","1"]}],
            },
            topic:skillTalkTopicId,
        },
        ...skillRespList,{
            text: "Never mind.",
            topic: "TALK_DONE"
        }]
    }

    dm.addData([skillTalkTopic],"CastAI",'SkillSwitch_TalkTopic');
    return skillTalkTopicId;
}
