"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpellCastExp = exports.getEventWeight = exports.getDisableSpellVar = exports.genTrueEocID = exports.genCastEocID = exports.parseSpellNumObj = exports.parseNumObj = exports.revTalker = void 0;
const cdda_schema_1 = require("cdda-schema");
const SADefine_1 = require("../SADefine");
//翻转u与n
function revTalker(obj) {
    let str = JSON.stringify(obj)
        .replace(/"u_(\w+?)":/g, '"tmpnpctmp_$1":') //缓存 eoc
        .replace(/(?<!\w)u_/g, 'tmpntmp_') //缓存 math内置函数
        .replace(/(?<!\w)U_/g, 'tmpNtmp_') //缓存 jmath函数
        .replace(/"npc_(\w+?)":/g, '"u_$1":')
        .replace(/(?<!\w)n_/g, 'u_')
        .replace(/(?<!\w)N_/g, 'U_')
        .replace(/tmpnpctmp_/g, 'npc_')
        .replace(/tmpntmp_/g, 'n_')
        .replace(/tmpNtmp_/g, 'N_');
    //修正无参条件
    const npcond = cdda_schema_1.NoParamTalkerCondList.join('|');
    const regex = new RegExp(`"n_(${npcond})"`, 'g');
    str = str.replace(regex, `"npc_$1"`);
    return JSON.parse(str);
}
exports.revTalker = revTalker;
/**解析NumObj为math表达式 */
function parseNumObj(value) {
    let strExp = `0`;
    if (value !== undefined) {
        if (typeof value == "number")
            strExp = value + "";
        else if (typeof value == "object" && "math" in value)
            strExp = value.math[0];
        else
            throw `伤害解析只支持固定值number 或 math表达式`;
    }
    return strExp;
}
exports.parseNumObj = parseNumObj;
/**解析法术伤害字符串 */
function parseSpellNumObj(spell, field, def) {
    if (def != undefined && spell[field] === undefined)
        return def + "";
    return parseNumObj(spell[field]);
}
exports.parseSpellNumObj = parseSpellNumObj;
/**生成施法eocid */
function genCastEocID(spell, cast_condition) {
    return SADefine_1.SADef.genEOCID(`Cast_${spell.id}_${cast_condition.id}`);
}
exports.genCastEocID = genCastEocID;
/**生成施法true_eoc id */
function genTrueEocID(spell, cast_condition) {
    return SADefine_1.SADef.genEOCID(`${spell.id}_TrueEoc_${cast_condition.id}`);
}
exports.genTrueEocID = genTrueEocID;
/**使某个技能停止使用的变量 */
function getDisableSpellVar(talker, spell) {
    return `${talker}_${spell.id}_switch_disable`;
}
exports.getDisableSpellVar = getDisableSpellVar;
/**获得施法的event权重 >0 <1 */
function getEventWeight(skill, cond) {
    const weight = cond.weight ?? skill.weight ?? 0;
    const fixweight = weight / 200 + 0.5;
    if (fixweight > 1 || fixweight < 0)
        throw `${skill.id} 的 weight: ${weight} 超出施法权重取值范围 -99 ~ 99`;
    return fixweight;
}
exports.getEventWeight = getEventWeight;
function getSpellCastExp(spell) {
    return `u_spell_level('${spell.id}`;
}
exports.getSpellCastExp = getSpellCastExp;
