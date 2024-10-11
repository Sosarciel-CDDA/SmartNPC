"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCastAITalkTopic = createCastAITalkTopic;
const ProcFunc_1 = require("./ProcFunc");
const SADefine_1 = require("../SADefine");
const CastAI_1 = require("./CastAI");
const CastAIGener_1 = require("./CastAIGener");
async function createCastAITalkTopic(dm) {
    //主对话
    const mainTalkTopic = {
        type: "talk_topic",
        id: ["TALK_FRIEND", "TALK_FRIEND_GUARD"],
        insert_before_standard_exits: true,
        responses: [{
                text: "[施法]我想让你释放法术。",
                topic: await createCastControlResp(dm)
            }]
    };
    //战斗对话
    const combatTalkTopic = {
        type: "talk_topic",
        id: ["TALK_COMBAT_COMMANDS"],
        insert_before_standard_exits: true,
        responses: [{
                text: "改一下你的施法方式吧……",
                topic: await createSkillResp(dm)
            }]
    };
    dm.addData([mainTalkTopic, combatTalkTopic], "CastAI", 'talk_topic');
}
/**创建施法对话 */
async function createCastControlResp(dm) {
    //主对话id
    const castControlTalkTopicId = SADefine_1.SADef.genTalkTopicID(`CastControl`);
    //刷新魔法值变量
    const update = SADefine_1.SADef.genActEoc("UpdateDisplayVal", [
        { math: ["u_display_mana", "=", "u_val('mana')"] }
    ]);
    dm.addInvokeEoc("NpcUpdate", 0, update);
    //施法主对话
    const castControlTalkTopic = {
        type: "talk_topic",
        id: castControlTalkTopicId,
        speaker_effect: {
            effect: [...ProcFunc_1.ControlCastSpeakerEffects]
        },
        dynamic_line: `&当前魔法值: <npc_val:display_mana> 公共冷却: <npc_val:coCooldown>`,
        responses: [...ProcFunc_1.ControlCastResps, {
                text: "Never mind.",
                topic: "TALK_NONE"
            }]
    };
    dm.addData([castControlTalkTopic, update], "CastAI", 'castcontrol_talk_topic');
    return castControlTalkTopicId;
}
/**创建技能对话 */
async function createSkillResp(dm) {
    //主对话id
    const skillTalkTopicId = SADefine_1.SADef.genTalkTopicID(`CastSwitch`);
    const skills = Object.values(CastAI_1.CastAIDataMap);
    //遍历技能
    const skillRespList = [];
    const skillRespEocList = [];
    for (const skill of skills) {
        const { id } = skill;
        const spell = (0, SADefine_1.getSpellByID)(id);
        const name = `<spell_name:${id}>`;
        const nstopVar = (0, CastAIGener_1.getDisableSpellVar)("n", spell);
        const ustopVar = (0, CastAIGener_1.getDisableSpellVar)("u", spell);
        //开关切换eoc
        const eoc = {
            type: "effect_on_condition",
            id: SADefine_1.SADef.genEOCID(`${id}_switch`),
            eoc_type: "ACTIVATION",
            effect: [{ math: [nstopVar, "=", "0"] }],
            false_effect: [{ math: [nstopVar, "=", "1"] }],
            condition: { math: [nstopVar, "==", "1"] },
        };
        skillRespEocList.push(eoc);
        //开关对话
        const resp = {
            condition: { math: [`n_spell_level('${spell.id}')`, ">=", "0"] },
            truefalsetext: {
                condition: { math: [nstopVar, "==", "1"] },
                true: `[已停用] ${name}`,
                false: `[已启用] ${name}`,
            },
            effect: { run_eocs: eoc.id },
            topic: "TALK_NONE",
        };
        skillRespList.push(resp);
    }
    //技能主对话
    const skillTalkTopic = {
        type: "talk_topic",
        id: skillTalkTopicId,
        dynamic_line: "&",
        responses: [...skillRespList, {
                text: "Never mind.",
                topic: "TALK_NONE"
            }]
    };
    dm.addData([skillTalkTopic, ...skillRespEocList], "CastAI", 'skillswitch_talk_topic');
    return skillTalkTopicId;
}
