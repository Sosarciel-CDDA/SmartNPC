"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcentratedAttack = exports.NoParamDefCastDataList = void 0;
exports.getDefCastData = getDefCastData;
const SADefine_1 = require("../SADefine");
/**无参预定义的施法数据 列表 */
exports.NoParamDefCastDataList = [
    "TargetDamage", //目标伤害
    "MeleeTargetDamage", //近战目标伤害
    "RangeTargetDamage", //远程目标伤害
    "BattleSelfBuff", //战斗自身buff
    "AlawaySelfBuff", //常态自身buff
    "BattleTargetBuff", //战斗目标buff
    "AlawayTargetBuff", //常态目标buff
];
//集火标记
exports.ConcentratedAttack = {
    type: "effect_type",
    id: SADefine_1.SADef.genEffectID("ConcentratedAttack"),
    name: ["被集火"],
    desc: ["被集火"],
};
/**施法数据生成器 表 */
const DefCastDataMap = {
    TargetDamage(data, spell) {
        const dat = {
            cast_condition: [{
                    hook: "TryAttack",
                }, {
                    hook: "BattleUpdate",
                    target: "filter_random",
                    condition: { math: [`n_effect_intensity('${exports.ConcentratedAttack.id}')`, ">", "0"] },
                    fallback_with: 5,
                },
                //{
                //    hook:"BattleUpdate",
                //    target:"random",
                //    fallback_with:10,
                //},
                {
                    hook: "None",
                    target: "control_cast",
                }],
            one_in_chance: 2,
        };
        return dat;
    },
    MeleeTargetDamage(data, spell) {
        const dat = {
            cast_condition: [{
                    hook: "TryMeleeAttack",
                }, {
                    hook: "BattleUpdate",
                    target: "filter_random",
                    condition: { math: [`n_effect_intensity('${exports.ConcentratedAttack.id}')`, ">", "0"] },
                    fallback_with: 5,
                },
                //{
                //    hook:"BattleUpdate",
                //    target:"random",
                //    fallback_with:10,
                //},
                {
                    hook: "None",
                    target: "control_cast",
                }],
            one_in_chance: 2,
        };
        return dat;
    },
    RangeTargetDamage(data, spell) {
        const dat = {
            cast_condition: [{
                    hook: "TryRangeAttack",
                }, {
                    hook: "BattleUpdate",
                    target: "filter_random",
                    condition: { math: [`n_effect_intensity('${exports.ConcentratedAttack.id}')`, ">", "0"] },
                    fallback_with: 5,
                },
                //{
                //    hook:"BattleUpdate",
                //    target:"random",
                //    fallback_with:10,
                //},
                {
                    hook: "None",
                    target: "control_cast",
                }],
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
            cast_condition: [{
                    condition: { math: [`n_effect_intensity('${spell.effect_str}')`, "<", "1"] },
                    hook: "BattleUpdate",
                    target: "filter_random"
                }, {
                    hook: "None",
                    target: "control_cast",
                }],
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
                }, {
                    hook: "None",
                    target: "control_cast",
                }],
            one_in_chance: 2,
            weight: 1,
        };
        return dat;
    },
    ItemCast(data, spell) {
        const base = DefCastDataMap[data.base](undefined, spell);
        const conds = Array.isArray(base.cast_condition) ? base.cast_condition : [base.cast_condition];
        conds.forEach((cond) => {
            data = data;
            //消耗充能
            if (data.consume_item !== true) {
                cond.condition = { and: [
                        { math: [`u_val('charge_count', 'item: ${data.item_id}')`, ">=", `${data.charge ?? 1}`] },
                        ...cond.condition ? [cond.condition] : []
                    ] };
                cond.fallback_with = cond.fallback_with !== undefined ? cond.fallback_with : 5;
                cond.after_effect = cond.after_effect ?? [];
                cond.after_effect.push({ u_consume_item: data.item_id, charges: data.charge });
            } //消耗物品
            else {
                cond.condition = { and: [
                        { math: [`u_val('item_count', 'item: ${data.item_id}')`, ">=", `${data.charge ?? 1}`] },
                        ...cond.condition ? [cond.condition] : []
                    ] };
                cond.fallback_with = cond.fallback_with !== undefined ? cond.fallback_with : 5;
                cond.after_effect = cond.after_effect ?? [];
                cond.after_effect.push({ u_consume_item: data.item_id, count: data.charge });
            }
            cond.force_lvl = data.force_lvl;
            cond.ignore_cost = true;
        });
        return base;
    },
    Inherit(data, spell) {
        const baseObj = DefCastDataMap[data.base](undefined, spell);
        const { type, base, ...rest } = data;
        for (const k in rest) {
            const v = rest[k];
            if (v !== undefined)
                baseObj[k] = v;
        }
        return baseObj;
    }
};
/**根据预定义的ID获得预定义施法数据 */
function getDefCastData(data, spellid) {
    let dtype = undefined;
    if (typeof data === "object" && "type" in data)
        dtype = data.type;
    else if (typeof data === "string")
        dtype = data;
    if (dtype == undefined)
        return data;
    const gener = DefCastDataMap[dtype];
    return gener(data, (0, SADefine_1.getSpellByID)(spellid));
}
