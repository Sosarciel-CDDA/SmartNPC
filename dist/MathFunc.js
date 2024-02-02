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
    dm.addStaticData([SumHp, AvgHp, MinHp, MaxHp], "MathFunc");
}
exports.createMathFunc = createMathFunc;
