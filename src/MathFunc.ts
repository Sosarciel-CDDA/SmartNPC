import { DataManager } from "cdda-event"
import { MathFunction, MathFunctionID } from "cdda-schema"



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
    dm.addStaticData([SumHp,AvgHp,MinHp,MaxHp],"MathFunc");
}

