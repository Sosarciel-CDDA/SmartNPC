"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisableSpellVar = exports.genTrueEocID = exports.genCastEocID = exports.parseSpellNumObj = exports.parseNumObj = exports.revTalker = void 0;
const cdda_schema_1 = require("cdda-schema");
const SADefine_1 = require("../SADefine");
//翻转u与n
function revTalker(obj) {
    let str = JSON.stringify(obj)
        .replace(/"u_(\w+?)":/g, '"tmpnpctmp_$1":')
        .replace(/(?<!\w)u_/g, 'tmpntmp_')
        .replace(/"npc_(\w+?)":/g, '"u_$1":')
        .replace(/(?<!\w)n_/g, 'u_')
        .replace(/tmpnpctmp_/g, 'npc_')
        .replace(/tmpntmp_/g, 'n_');
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
    return SADefine_1.SADef.genEOCID(`Cast${spell.id}_${cast_condition.id}`);
}
exports.genCastEocID = genCastEocID;
/**生成施法true_eoc id */
function genTrueEocID(spell, cast_condition) {
    return SADefine_1.SADef.genEOCID(`${spell.id}TrueEoc_${cast_condition.id}`);
}
exports.genTrueEocID = genTrueEocID;
/**使某个技能停止使用的变量 */
function getDisableSpellVar(talker, spell) {
    return `${talker}_${spell.id}_disable`;
}
exports.getDisableSpellVar = getDisableSpellVar;
