import { DataManager } from "@sosarciel-cdda/cdda-event"
import { MathFunction, MathFunctionID } from "@sosarciel-cdda/cdda-schema"



export async function createMathFunc(dm:DataManager){
    /**血量总和  
     * function()  
     */
    const SumHp:MathFunction={
        type:"jmath_function",
        id:"SumHp" as MathFunctionID,
        num_args: 0,
        return:"u_hp('torso') + u_hp('head') + u_hp('leg_l') + u_hp('leg_r') + u_hp('arm_l') + u_hp('arm_r')"
    }
    /**平均血量  
     * function()  
     */
    const AvgHp:MathFunction={
        type:"jmath_function",
        id:"AvgHp" as MathFunctionID,
        num_args: 0,
        return:"SumHp()/6"
    }
    /**最低血量  
     * function()  
     */
    const MinHp:MathFunction={
        type:"jmath_function",
        id:"MinHp" as MathFunctionID,
        num_args: 0,
        return:"min(u_hp('torso') , u_hp('head') , u_hp('leg_l') , u_hp('leg_r') , u_hp('arm_l') , u_hp('arm_r'))"
    }
    /**最高血量  
     * function()  
     */
    const MaxHp:MathFunction={
        type:"jmath_function",
        id:"MaxHp" as MathFunctionID,
        num_args: 0,
        return:"max(u_hp('torso') , u_hp('head') , u_hp('leg_l') , u_hp('leg_r') , u_hp('arm_l') , u_hp('arm_r'))"
    }
    /**根据专注调整经验值 */
    const UAdjForFocus:MathFunction={
        type:"jmath_function",
        id:"U_AdjForFocus" as MathFunctionID,
        num_args: 0,
        return:"max(u_val('focus') * (0.01 * u_val('intelligence') + 1), 1) / 100"
    }
    const NAdjForFocus:MathFunction={
        type:"jmath_function",
        id:"N_AdjForFocus" as MathFunctionID,
        num_args: 0,
        return:"max(n_val('focus') * (0.01 * n_val('intelligence') + 1), 1) / 100"
    }
    /**根据难度获得施法经验  
     * (法术难度)=> number  
     */
    const USpellCastExp:MathFunction={
        type:"jmath_function",
        id:"U_SpellCastExp" as MathFunctionID,
        num_args: 1,
        return:"((((u_val('intelligence') - 8) / 8) + (_0 / 20) + (u_skill('spellcraft') / 10)) / 5 + 1) * 75 * U_AdjForFocus()"
    }
    const NSpellCastExp:MathFunction={
        type:"jmath_function",
        id:"N_SpellCastExp" as MathFunctionID,
        num_args: 1,
        return:"((((n_val('intelligence') - 8) / 8) + (_0 / 20) + (n_skill('spellcraft') / 10)) / 5 + 1) * 75 * N_AdjForFocus()"
    }
    dm.addData([SumHp,AvgHp,MinHp,MaxHp,UAdjForFocus,NAdjForFocus,USpellCastExp,NSpellCastExp],"MathFunc");
}

