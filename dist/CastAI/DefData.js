"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefCastData = exports.NoParamDefCastDataList = void 0;
const SADefine_1 = require("../SADefine");
/**无参预定义的施法数据 列表 */
exports.NoParamDefCastDataList = [
    "TargetDamage", //目标伤害
    "BattleSelfBuff", //战斗自身buff
    "AlawaySelfBuff", //常态自身buff
    "BattleTargetBuff", //战斗目标buff
    "AlawayTargetBuff", //常态目标buff
];
/**施法数据生成器 表 */
const DefCastDataMap = {
    TargetDamage(data, spell) {
        const dat = {
            cast_condition: { hook: "TryAttack" },
            one_in_chance: 2,
        };
        return dat;
    },
    BattleSelfBuff(data, spell) {
        const dat = {
            cast_condition: {
                condition: { math: [`u_effect_intensity('${spell.effect_str}')`, "<", "1"] },
                hook: "BattleUpdate"
            },
            one_in_chance: 2,
            weight: 1,
        };
        return dat;
    },
    AlawaySelfBuff(data, spell) {
        const dat = {
            cast_condition: [{
                    condition: { math: [`u_effect_intensity('${spell.effect_str}')`, "<", "1"] },
                    hook: "BattleUpdate"
                }, {
                    condition: { math: [`u_effect_intensity('${spell.effect_str}')`, "<", "1"] },
                    hook: "SlowUpdate"
                }],
            one_in_chance: 2,
            weight: 1,
        };
        return dat;
    },
    BattleTargetBuff(data, spell) {
        const dat = {
            cast_condition: {
                condition: { math: [`n_effect_intensity('${spell.effect_str}')`, "<", "1"] },
                hook: "BattleUpdate",
                target: "filter_random"
            },
            one_in_chance: 2,
            weight: 1,
        };
        return dat;
    },
    AlawayTargetBuff(data, spell) {
        const dat = {
            cast_condition: [{
                    condition: { math: [`n_effect_intensity('${spell.effect_str}')`, "<", "1"] },
                    hook: "BattleUpdate",
                    target: "filter_random"
                }, {
                    condition: { math: [`n_effect_intensity('${spell.effect_str}')`, "<", "1"] },
                    hook: "SlowUpdate",
                    target: "filter_random"
                }],
            one_in_chance: 2,
            weight: 1,
        };
        return dat;
    },
    ItemCast(data, spell) {
        data = data;
        const base = DefCastDataMap[data.base](data.base, spell);
        const conds = Array.isArray(base.cast_condition) ? base.cast_condition : [base.cast_condition];
        conds.forEach((cond) => {
            data = data;
            //消耗充能
            if (data.consume_item !== true) {
                cond.condition = { and: [
                        { math: [`u_val('charge_count', 'item: ${data.item_id}')`, ">=", `${data.charge ?? 1}`] },
                        ...cond.condition ? [cond.condition] : []
                    ] };
                cond.after_effect = cond.after_effect ?? [];
                cond.after_effect.push({ u_consume_item: data.item_id, charges: data.charge });
            } //消耗物品
            else {
                cond.condition = { and: [
                        { math: [`u_val('item_count', 'item: ${data.item_id}')`, ">=", `${data.charge ?? 1}`] },
                        ...cond.condition ? [cond.condition] : []
                    ] };
                cond.after_effect = cond.after_effect ?? [];
                cond.after_effect.push({ u_consume_item: data.item_id, count: data.charge });
            }
            cond.force_lvl = data.force_lvl;
            cond.ignore_cost = true;
        });
        return base;
    },
};
/**根据预定义的ID获得预定义施法数据 */
function getDefCastData(data, spellid) {
    let dtype = undefined;
    if (typeof data === "object" && "type" in data)
        dtype = data.type;
    else if (typeof data === "string")
        dtype = data;
    if (DefCastDataMap[dtype] !== undefined)
        return DefCastDataMap[dtype](data, (0, SADefine_1.getSpellByID)(spellid));
    return data;
}
exports.getDefCastData = getDefCastData;
