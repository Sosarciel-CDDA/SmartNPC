import { DataManager } from "@sosarciel-cdda/event";
import { ControlCastResps, ControlCastSpeakerEffects } from "./ProcFunc";
import { BoolObj, DynamicLine, EffectID, Eoc, EocEffect, Resp, TalkTopic, TalkTopicID } from "@sosarciel-cdda/schema";
import { SADef, getSpellByID } from "@src/SADefine";
import { CastAIDataMap } from "./CastAI";
import { CastAIData } from "./CastAIInterface";
import { getDisableSpellVar } from "./CastAIGener";



export async function createCastAITalkTopic(dm:DataManager){
    //主对话
    const mainTalkTopic:TalkTopic={
        type:"talk_topic",
        id:["TALK_FRIEND","TALK_FRIEND_GUARD"],
        insert_before_standard_exits:true,
        responses:[{
            text : "[施法]我想让你释放法术。",
            topic: await createCastControlResp(dm)
        }]
    }
    //战斗对话
    const combatTalkTopic:TalkTopic={
        type:"talk_topic",
        id:["TALK_COMBAT_COMMANDS"],
        insert_before_standard_exits:true,
        responses:[{
            text : "改一下你的施法方式吧……",
            topic: await createSkillResp(dm)
        }]
    }
    dm.addData([mainTalkTopic,combatTalkTopic],"CastAI",'talk_topic');
}

/**创建施法对话 */
async function createCastControlResp(dm:DataManager){
    //主对话id
    const castControlTalkTopicId = SADef.genTalkTopicID(`CastControl`);

    //刷新魔法值变量
    const update = SADef.genActEoc("UpdateDisplayVal",[
        {math:["u_display_mana","=","u_val('mana')"]}
    ]);
    dm.addInvokeEoc("NpcUpdate",0,update);

    //施法主对话
    const castControlTalkTopic:TalkTopic={
        type:"talk_topic",
        id:castControlTalkTopicId,
        speaker_effect:{
            effect:[...ControlCastSpeakerEffects]
        },
        dynamic_line:`&当前魔法值: <npc_val:display_mana> 公共冷却: <npc_val:coCooldown>`,
        responses:[...ControlCastResps,{
            text: "Never mind.",
            topic: "TALK_NONE"
        }]
    }
    dm.addData([castControlTalkTopic,update],"CastAI",'castcontrol_talk_topic');
    return castControlTalkTopicId;
}


/**创建技能对话 */
async function createSkillResp(dm:DataManager){
    //主对话id
    const skillTalkTopicId = SADef.genTalkTopicID(`CastSwitch`);

    const skills = (Object.values(CastAIDataMap) as CastAIData[]);

    //遍历技能
    const skillRespList:Resp[] = [];
    const skillRespEocList:Eoc[] = [];
    for(const skill of skills){
        const {id} = skill;
        const spell = getSpellByID(id);
        const name = `<spell_name:${id}>`;

        const nstopVar = getDisableSpellVar("n",spell);
        const ustopVar = getDisableSpellVar("u",spell);

        //开关切换eoc
        const eoc:Eoc={
            type:"effect_on_condition",
            id:SADef.genEOCID(`${id}_switch`),
            eoc_type:"ACTIVATION",
            effect:[{math:[nstopVar,"=","0"]}],
            false_effect:[{math:[nstopVar,"=","1"]}],
            condition:{math:[nstopVar,"==","1"]},
        }
        skillRespEocList.push(eoc)

        //开关对话
        const resp:Resp={
            condition:{math:[`n_spell_level('${spell.id}')`,">=","0"]},
            truefalsetext:{
                condition:{math:[nstopVar,"==","1"]},
                true:`[已停用] ${name}`,
                false:`[已启用] ${name}`,
            },
            effect:{run_eocs:eoc.id},
            topic:"TALK_NONE",
        }
        skillRespList.push(resp);
    }

    //技能主对话
    const skillTalkTopic:TalkTopic={
        type:"talk_topic",
        id:skillTalkTopicId,
        dynamic_line:"&",
        responses:[...skillRespList,{
            text: "Never mind.",
            topic: "TALK_NONE"
        }]
    }

    dm.addData([skillTalkTopic,...skillRespEocList],"CastAI",'skillswitch_talk_topic');
    return skillTalkTopicId;
}
