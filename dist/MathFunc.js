"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMathFunc = void 0;
async function createMathFunc(dm) {
    /**血量总和
     * function()
     */
    const SumHp = {
        type: "jmath_function",
        id: "SumHp",
        num_args: 0,
        return: "u_hp('torso') + u_hp('head') + u_hp('leg_l') + u_hp('leg_r') + u_hp('arm_l') + u_hp('arm_r')"
    };
    /**平均血量
     * function()
     */
    const AvgHp = {
        type: "jmath_function",
        id: "AvgHp",
        num_args: 0,
        return: "SumHp()/6"
    };
    /**最低血量
     * function()
     */
    const MinHp = {
        type: "jmath_function",
        id: "MinHp",
        num_args: 0,
        return: "min(u_hp('torso') , u_hp('head') , u_hp('leg_l') , u_hp('leg_r') , u_hp('arm_l') , u_hp('arm_r'))"
    };
    /**最高血量
     * function()
     */
    const MaxHp = {
        type: "jmath_function",
        id: "MaxHp",
        num_args: 0,
        return: "max(u_hp('torso') , u_hp('head') , u_hp('leg_l') , u_hp('leg_r') , u_hp('arm_l') , u_hp('arm_r'))"
    };
    /**根据专注调整经验值 */
    const UAdjForFocus = {
        type: "jmath_function",
        id: "U_AdjForFocus",
        num_args: 0,
        return: "max(u_val('focus') * (0.01 * u_val('intelligence') + 1), 1) / 100"
    };
    const NAdjForFocus = {
        type: "jmath_function",
        id: "N_AdjForFocus",
        num_args: 0,
        return: "max(n_val('focus') * (0.01 * n_val('intelligence') + 1), 1) / 100"
    };
    /**根据难度获得施法经验
     * (法术难度)=> number
     */
    const USpellCastExp = {
        type: "jmath_function",
        id: "U_SpellCastExp",
        num_args: 1,
        return: "((((u_val('intelligence') - 8) / 8) + (_0 / 20) + (u_skill('spellcraft') / 10)) / 5 + 1) * 75 * UAdjForFocus()"
    };
    const NSpellCastExp = {
        type: "jmath_function",
        id: "N_SpellCastExp",
        num_args: 1,
        return: "((((n_val('intelligence') - 8) / 8) + (_0 / 20) + (n_skill('spellcraft') / 10)) / 5 + 1) * 75 * NAdjForFocus()"
    };
    dm.addStaticData([SumHp, AvgHp, MinHp, MaxHp, UAdjForFocus, NAdjForFocus, USpellCastExp, NSpellCastExp], "MathFunc");
}
exports.createMathFunc = createMathFunc;
