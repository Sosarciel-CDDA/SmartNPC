import { DataManager } from "cdda-event";
import { ControlCastResps } from "./ProcFunc";
import { DynamicLine, Eoc, Resp, TalkTopic } from "cdda-schema";
import { SADef, getSpellByID } from "@src/SADefine";
import { CastAIDataMap } from "./CastAI";
import { CastAIData } from "./CastAIInterface";
import { getDisableSpellVar } from "./CastAIGener";



export async function createCastAITalkTopic(dm:DataManager){
    //扩展对话
    const extTalkTopic:TalkTopic={
        type:"talk_topic",
        id:["TALK_FRIEND","TALK_FRIEND_GUARD"],
        responses:[{
            text : "[施法]我想你释放法术。",
            topic: await createCastControlResp(dm)
        },{
            text : "[施法]我想改变你的施法选择。",
            topic: await createSkillResp(dm)
        }]
    }
    dm.addStaticData([extTalkTopic],"CastAI",'talk_topic');
}

/**创建施法对话 */
async function createCastControlResp(dm:DataManager){
    //主对话id
    const castControlTalkTopicId = SADef.genTalkTopicID(`CastControl`);

    //施法主对话
    const castControlTalkTopic:TalkTopic={
        type:"talk_topic",
        id:castControlTalkTopicId,
        dynamic_line:`&当前魔法值: <npc_val:show_mana>`,
        //dynamic_line:{concatenate:["&",...dynLine]},
        responses:[...ControlCastResps,{
            text : "[返回]算了。",
            topic: "TALK_NONE"
        }]
    }
    dm.addStaticData([castControlTalkTopic],"CastAI",'castcontrol_talk_topic');
    return castControlTalkTopicId;
}


/**创建技能对话 */
async function createSkillResp(dm:DataManager){
    //主对话id
    const skillTalkTopicId = SADef.genTalkTopicID(`SkillSwitch`);

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
            condition:{math:[`u_val('spell_level', 'spell: ${spell.id}')`,">","0"]},
            truefalsetext:{
                condition:{math:[nstopVar,"==","1"]},
                true:`[已停用] ${name}`,
                false:`[已启用] ${name}`,
            },
            effect:{run_eocs:eoc.id},
            topic:skillTalkTopicId,
        }
        skillRespList.push(resp);
    }

    //技能主对话
    const skillTalkTopic:TalkTopic={
        type:"talk_topic",
        id:skillTalkTopicId,
        dynamic_line:"&",
        responses:[...skillRespList,{
            text : "[继续]走吧。",
            topic: "TALK_DONE"
        }]
    }

    dm.addStaticData([skillTalkTopic,...skillRespEocList],"CastAI",'skillswitch_talk_topic');
    return skillTalkTopicId;
}