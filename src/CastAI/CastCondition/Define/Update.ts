import { BoolExpr } from "@sosarciel-cdda/schema";
import { CastAIData } from "../../Interface";
import { DefineCastCond, DefineCastCondFunc } from "../Interface";
import { concentratedDamageCast, genEffectCond, randomDamageCast } from "../Util";


/**战斗自身buff */
export type BattleSelfBuff = DefineCastCond<"BattleSelfBuff">;
export const BattleSelfBuff:DefineCastCondFunc<BattleSelfBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:{
            condition:{math:[`u_effect_intensity('${spell.effect_str}')`,"<","1"]},
            hook:"BattleUpdate",
            target:'random',
            force_vaild_target:['self'],
        },
        one_in_chance:2,
        weight:1,
    }
    return dat;
}

/**常态自身buff */
export type AlawaySelfBuff = DefineCastCond<"AlawaySelfBuff">;
export const AlawaySelfBuff:DefineCastCondFunc<AlawaySelfBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            condition:{math:[`u_effect_intensity('${spell.effect_str}')`,"<","1"]},
            hook:"BattleUpdate",
            target:'raw',
            force_vaild_target:['self'],
        },{
            condition:{math:[`u_effect_intensity('${spell.effect_str}')`,"<","1"]},
            hook:"SlowUpdate",
            target:'raw',
            force_vaild_target:['self'],
        }],
        one_in_chance:2,
        weight:1,
    }
    return dat;
}

/**战斗目标buff */
export type BattleTargetBuff = DefineCastCond<"BattleTargetBuff">;
export const BattleTargetBuff:DefineCastCondFunc<BattleTargetBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            condition:genEffectCond(spell),
            hook:"BattleUpdate",
            target:"filter_random"
        },{
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
        weight:1,
    }
    return dat;
}

/**常态目标buff */
export type AlawayTargetBuff = DefineCastCond<"AlawayTargetBuff">;
export const AlawayTargetBuff:DefineCastCondFunc<AlawayTargetBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            condition:{math:[`n_effect_intensity('${spell.effect_str}')`,"<","1"]},
            hook:"BattleUpdate",
            target:"filter_random"
        },{
            condition:{math:[`n_effect_intensity('${spell.effect_str}')`,"<","1"]},
            hook:"SlowUpdate",
            target:"filter_random"
        },{
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
        weight:1,
    }
    return dat;
}

/**条件触发的自身buff */
export type AlawaySelfBuffCond = DefineCastCond<"AlawaySelfBuffCond",{
    /**触发条件 u 为自身 n 不存在 */
    condition:BoolExpr
}>;
export const AlawaySelfBuffCond:DefineCastCondFunc<AlawaySelfBuffCond> = (data,spell)=>{
    const {condition} = data;
    return {
        cast_condition:[{
            condition:condition,
            hook:"BattleUpdate",
            target:'raw',
            force_vaild_target:['self'],
        },{
            condition:condition,
            hook:"SlowUpdate",
            target:'raw',
            force_vaild_target:['self'],
        }]
    }
}


/**条件触发的自身buff */
export type BattleSelfBuffCond = DefineCastCond<"BattleSelfBuffCond",{
    /**触发条件 u 为自身 n 不存在 */
    condition:BoolExpr
}>;
export const BattleSelfBuffCond:DefineCastCondFunc<BattleSelfBuffCond> = (data,spell)=>{
    const {condition} = data;
    return {
        cast_condition:[{
            condition:condition,
            hook:"BattleUpdate",
            target:'raw',
            force_vaild_target:['self'],
        }],
        one_in_chance:2,
        weight:1,
    }
}

/**条件触发的目标buff */
export type BattleTargetBuffCond = DefineCastCond<"BattleTargetBuffCond",{
    /**触发条件 u 为自身 n 为目标 */
    condition:BoolExpr
}>;
export const BattleTargetBuffCond:DefineCastCondFunc<BattleTargetBuffCond> = (data,spell)=>{
    const {condition} = data;
    const dat:CastAIData = {
        cast_condition:[{
            condition:condition,
            hook:"BattleUpdate",
            target:"filter_random"
        },{
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
        weight:1,
    }
    return dat;
}