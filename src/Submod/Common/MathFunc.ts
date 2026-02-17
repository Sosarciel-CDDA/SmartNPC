import { DataManager } from "@sosarciel-cdda/event"
import { JM, MathFunction, MathFunctionID } from "@sosarciel-cdda/schema"



const replaceFron = (arg:{
    id:string,
    from:MathFunction,
    source:RegExp,
    traget:string,
})=>{
    const {from,id,source,traget} = arg;
    return {
        ...from, id,
        return:from.return.replace(source,traget)
    }
}

const ReplaceUHP = {
    source:/u_hp/g,
    traget:'n_hp',
}

const ReplaceUHPMax = {
    source:/u_hp_max/g,
    traget:'n_hp_max',
}

export async function createMathFunc(dm:DataManager){
    /**血量总和  
     * function()  
     */
    const USumHp:MathFunction={
        type:"jmath_function",
        id:"U_SumHp" as MathFunctionID,
        num_args: 0,
        return:"u_hp('torso') + u_hp('head') + u_hp('leg_l') + u_hp('leg_r') + u_hp('arm_l') + u_hp('arm_r')"
    }
    /**血量总和  
     * function()  
     */
    const NSumHp=replaceFron({
        id:"N_SumHp",
        from:USumHp,
        ...ReplaceUHP,
    })

    /**最大血量总和  
     * function()  
     */
    const USumMaxHp:MathFunction={
        type:"jmath_function",
        id:"U_SumMaxHp" as MathFunctionID,
        num_args: 0,
        return:"u_hp_max('torso') + u_hp_max('head') + u_hp_max('leg_l') + u_hp_max('leg_r') + u_hp_max('arm_l') + u_hp_max('arm_r')"
    }
    /**最大血量总和  
     * function()  
     */
    const NSumMaxHp=replaceFron({
        id:"N_SumMaxHp",
        from:USumMaxHp,
        ...ReplaceUHPMax,
    });


    /**平均血量  
     * function()  
     */
    const UAvgHp:MathFunction={
        type:"jmath_function",
        id:"U_AvgHp" as MathFunctionID,
        num_args: 0,
        return:`${USumHp.id}()/6`
    }
    const NAvgHp:MathFunction={
        type:"jmath_function",
        id:"N_AvgHp" as MathFunctionID,
        num_args: 0,
        return:`${NSumHp.id}()/6`
    }


    /**最低血量  
     * function()  
     */
    const UMinHp:MathFunction={
        type:"jmath_function",
        id:"U_MinHp" as MathFunctionID,
        num_args: 0,
        return:"min(u_hp('torso') , u_hp('head') , u_hp('leg_l') , u_hp('leg_r') , u_hp('arm_l') , u_hp('arm_r'))"
    }
    /**最低血量  
     * function()  
     */
    const NMinHp=replaceFron({
        id:"N_MinHp",
        from:UMinHp,
        ...ReplaceUHP,
    });


    /**最高血量  
     * function()  
     */
    const UMaxHp:MathFunction={
        type:"jmath_function",
        id:"U_MaxHp" as MathFunctionID,
        num_args: 0,
        return:"max(u_hp('torso') , u_hp('head') , u_hp('leg_l') , u_hp('leg_r') , u_hp('arm_l') , u_hp('arm_r'))"
    }
    /**最高血量  
     * function()  
     */
    const NMaxHp=replaceFron({
        id:"N_MaxHp",
        from:UMaxHp,
        ...ReplaceUHP,
    });

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
    const ProfBonusCalc:MathFunction= {
        "type": "jmath_function",
        "id": "enhancement_proficiency_bonus_calculate",
        "num_args": 2,
        "return": "_0 + (((((u_proficiency('prof_magic_enhancement_beginner', 'format': 'percent') * 1) / 10) + ((u_proficiency('prof_magic_enhancement_apprentice', 'format': 'percent') * 1) / 10) + ((u_proficiency('prof_magic_enhancement_master', 'format': 'percent') * 1) / 10))) * _1 )"
    }
    const ProfNegCalc:MathFunction= {
        "type": "jmath_function",
        "id": "enhancement_proficiency_negate_calculate",
        "num_args": 2,
        "return": "_0 - (((((u_proficiency('prof_magic_enhancement_beginner', 'format': 'percent') * 1) / 10) + ((u_proficiency('prof_magic_enhancement_apprentice', 'format': 'percent') * 1) / 10) + ((u_proficiency('prof_magic_enhancement_master', 'format': 'percent') * 1) / 10))) * _1 )"
    }
    dm.addData([
        USumHp, NSumHp,
        USumMaxHp,NSumMaxHp,
        UAvgHp,NAvgHp,
        UMinHp,NMinHp,
        UMaxHp,NMaxHp,
        UAdjForFocus,NAdjForFocus,
        USpellCastExp,NSpellCastExp,
        ProfBonusCalc,ProfNegCalc
    ],"Common","MathFunc");
}

