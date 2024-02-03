"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCastAI = exports.CastAIDataMap = void 0;
const utils_1 = require("@zwa73/utils");
const SADefine_1 = require("../SADefine");
const UtilSpell_1 = require("../UtilSpell");
const CastAIGener_1 = require("./CastAIGener");
const ProcFunc_1 = require("./ProcFunc");
const path = require("path");
const DefData_1 = require("./DefData");
const TalkTopic_1 = require("./TalkTopic");
//全局冷却字段名
const gcdValName = `u_coCooldown`;
//falback字段名
const fallbackValName = "u_castFallbackCounter";
//法术消耗变量类型映射
const COST_MAP = {
    "BIONIC": "u_val('power')",
    "HP": "u_hp('torso')",
    "MANA": "u_val('mana')",
    "STAMINA": "u_val('stamina')",
    "NONE": undefined,
};
//载入数据
/**施法AI数据 */
exports.CastAIDataMap = {};
const tableList = utils_1.UtilFT.fileSearchGlob(path.join(SADefine_1.DATA_PATH, "CastAI", "**", "*.json").replaceAll("\\", "/"));
tableList.forEach((file) => {
    const json = utils_1.UtilFT.loadJSONFileSync(file);
    Object.entries(json.table).forEach(([spellID, castData]) => {
        if (castData == undefined)
            throw "";
        //转换预定义castAiData
        castData = (0, DefData_1.getDefCastData)(castData, spellID);
        castData.id = castData.id ?? spellID;
        exports.CastAIDataMap[spellID] = castData;
        //处理共同条件
        if (json.require_mod)
            castData.common_condition = castData.common_condition !== undefined
                ? { and: [castData.common_condition, { mod_is_loaded: json.require_mod }] }
                : { mod_is_loaded: json.require_mod };
    });
});
/**处理角色技能 */
async function createCastAI(dm) {
    const out = [];
    //权重排序
    const skills = Object.values(exports.CastAIDataMap);
    //全局冷却事件
    const GCDEoc = SADefine_1.SADef.genActEoc(`CoCooldown`, [{ math: [gcdValName, "-=", "1"] }], { math: [gcdValName, ">", "0"] });
    //备用计数器
    const FBEoc = SADefine_1.SADef.genActEoc(`Fallback`, [{ math: [fallbackValName, "+=", "1"] }], { math: [fallbackValName, "<", "1000"] });
    dm.addInvokeEoc("NpcUpdate", 0, GCDEoc, FBEoc);
    //初始化全局冷却
    const GCDInit = SADefine_1.SADef.genActEoc(`CoCooldown_Init`, [{ math: [gcdValName, "=", "0"] }]);
    dm.addInvokeEoc("Init", 0, GCDInit);
    out.push(GCDEoc, FBEoc, GCDInit);
    //遍历技能
    for (const skill of skills) {
        const { id, cast_condition, cooldown, common_cooldown, after_effect, before_effect, common_condition } = skill;
        //获取法术数据
        const spell = (0, SADefine_1.getSpellByID)(id);
        //法术消耗字符串
        const spellCost = `min(${(0, CastAIGener_1.parseSpellNumObj)(spell, "base_energy_cost")} + ${(0, CastAIGener_1.parseSpellNumObj)(spell, "energy_increment")} * ` +
            `u_spell_level('${spell.id}'), ${(0, CastAIGener_1.parseSpellNumObj)(spell, "final_energy_cost", SADefine_1.MAX_NUM)})`;
        //法术消耗变量类型
        const costVar = spell.energy_source !== undefined
            ? COST_MAP[spell.energy_source]
            : undefined;
        //生成冷却变量名
        const cdValName = `u_${spell.id}_cooldown`;
        //前置效果
        const pre_effect = [];
        if (before_effect)
            pre_effect.push(...before_effect);
        //遍历释放条件
        const ccs = Array.isArray(cast_condition)
            ? cast_condition
            : [cast_condition];
        ccs.forEach((cc, i) => cc.id = cc.id ?? i + "");
        //遍历释放条件生成施法eoc
        for (const cast_condition of ccs) {
            const { target, ignore_cost, fallback_with } = cast_condition;
            //计算成功效果
            const true_effect = [];
            //共通冷却
            if (common_cooldown != 0)
                true_effect.push({ math: [gcdValName, "=", `${common_cooldown ?? 1}`] });
            //独立冷却
            if (cooldown)
                true_effect.push({ math: [cdValName, "=", `${cooldown ?? 0}`] });
            //追加效果
            if (after_effect)
                true_effect.push(...after_effect);
            //施法时间
            if (spell.base_casting_time) {
                const ct = `min(${(0, CastAIGener_1.parseSpellNumObj)(spell, "base_casting_time")} + ${(0, CastAIGener_1.parseSpellNumObj)(spell, "casting_time_increment")} * ` +
                    `u_spell_level('${spell.id}'), ${(0, CastAIGener_1.parseSpellNumObj)(spell, "final_casting_time", SADefine_1.MAX_NUM)})`;
                true_effect.push({ math: [UtilSpell_1.SPELL_CT_MODMOVE_VAR, "=", ct] }, { u_cast_spell: { id: UtilSpell_1.SPELL_CT_MODMOVE, hit_self: true } });
            }
            //能量消耗
            if (spell.base_energy_cost != undefined && costVar != undefined && ignore_cost !== true)
                true_effect.push({ math: [costVar, "-=", spellCost] });
            //经验增长
            if (cast_condition.infoge_exp != true)
                true_effect.push({ math: [`u_skill_exp('${spell.difficulty ?? 0}')`, "+=", `U_SpellCastExp(${spell.difficulty ?? 0})`] });
            //清空备用计数器
            if (fallback_with === undefined)
                true_effect.push({ math: [fallbackValName, "=", "0"] });
            //计算基础条件 确保第一个为技能开关, 用于cast_control读取
            const base_cond = [
                { math: [(0, CastAIGener_1.getDisableSpellVar)("u", spell), "!=", "1"] },
                "u_is_npc",
                { math: [`u_spell_level('${spell.id}')`, ">=", "0"] },
                { math: [gcdValName, "<=", "0"] },
            ];
            //共同条件
            if (common_condition)
                base_cond.push(common_condition);
            //能量消耗
            if (spell.base_energy_cost != undefined && costVar != undefined && ignore_cost !== true)
                base_cond.push({ math: [costVar, ">=", spellCost] });
            //物品消耗
            //if(spell.)
            //冷却
            if (cooldown)
                base_cond.push({ math: [cdValName, "<=", "0"] });
            //备用计数器
            if (fallback_with !== undefined)
                base_cond.push({ math: [fallbackValName, ">=", `${fallback_with}`] });
            //计算施法等级
            let min_level = { math: [`u_spell_level('${spell.id}')`] };
            if (cast_condition.force_lvl != null)
                min_level = cast_condition.force_lvl;
            //处理并加入输出
            const dat = {
                skill, true_effect, pre_effect,
                base_cond, cast_condition, min_level
            };
            //生成法术
            out.push(...(await (0, ProcFunc_1.procSpellTarget)(target, dm, dat)));
        }
        //独立冷却事件
        if (cooldown) {
            const CDEoc = SADefine_1.SADef.genActEoc(`${spell.id}_cooldown`, [{ math: [cdValName, "-=", "1"] }], { math: [cdValName, ">", "0"] });
            dm.addInvokeEoc("NpcUpdate", 0, CDEoc);
            //初始化冷却
            const CDInit = SADefine_1.SADef.genActEoc(`${spell.id}_cooldown_Init`, [{ math: [cdValName, "=", "0"] }]);
            dm.addInvokeEoc("Init", 0, CDInit);
            out.push(CDEoc, CDInit);
        }
    }
    dm.addStaticData(out, "CastAI", "skill");
    //创建对话
    await (0, TalkTopic_1.createCastAITalkTopic)(dm);
}
exports.createCastAI = createCastAI;
