"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCastAITalkTopic = void 0;
const ProcFunc_1 = require("./ProcFunc");
const SADefine_1 = require("../SADefine");
const CastAI_1 = require("./CastAI");
const CastAIGener_1 = require("./CastAIGener");
async function createCastAITalkTopic(dm) {
    //扩展对话
    const extTalkTopic = {
        type: "talk_topic",
        id: ["TALK_FRIEND", "TALK_FRIEND_GUARD"],
        responses: [{
                text: "[施法]我想你释放法术。",
                topic: await createCastControlResp(dm)
            }, {
                text: "[施法]我想改变你的施法选择。",
                topic: await createSkillResp(dm)
            }]
    };
    dm.addStaticData([extTalkTopic], "CastAI", 'talk_topic');
}
exports.createCastAITalkTopic = createCastAITalkTopic;
/**创建施法对话 */
async function createCastControlResp(dm) {
    //主对话id
    const castControlTalkTopicId = SADefine_1.SADef.genTalkTopicID(`CastControl`);
    //施法主对话
    const castControlTalkTopic = {
        type: "talk_topic",
        id: castControlTalkTopicId,
        dynamic_line: `&当前魔法值: <npc_val:show_mana>`,
        //dynamic_line:{concatenate:["&",...dynLine]},
        responses: [...ProcFunc_1.ControlCastResps, {
                text: "[返回]算了。",
                topic: "TALK_NONE"
            }]
    };
    dm.addStaticData([castControlTalkTopic], "CastAI", 'castcontrol_talk_topic');
    return castControlTalkTopicId;
}
/**创建技能对话 */
async function createSkillResp(dm) {
    //主对话id
    const skillTalkTopicId = SADefine_1.SADef.genTalkTopicID(`SkillSwitch`);
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
            condition: { math: [`u_val('spell_level', 'spell: ${spell.id}')`, ">", "0"] },
            truefalsetext: {
                condition: { math: [nstopVar, "==", "1"] },
                true: `[已停用] ${name}`,
                false: `[已启用] ${name}`,
            },
            effect: { run_eocs: eoc.id },
            topic: skillTalkTopicId,
        };
        skillRespList.push(resp);
    }
    //技能主对话
    const skillTalkTopic = {
        type: "talk_topic",
        id: skillTalkTopicId,
        dynamic_line: "&",
        responses: [...skillRespList, {
                text: "[继续]走吧。",
                topic: "TALK_DONE"
            }]
    };
    dm.addStaticData([skillTalkTopic, ...skillRespEocList], "CastAI", 'skillswitch_talk_topic');
    return skillTalkTopicId;
}
