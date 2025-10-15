import { BoolExpr, JM } from "@sosarciel-cdda/schema";
import { CastAIData } from "../../Interface";
import { DefineCastCond, DefineCastCondFunc } from "../Interface";
import { concentratedDamageCast, genEffectCond, randomDamageCast } from "../Util";
import { getAoeExpr } from "../../UtilFunc";

//#region 自身buff

/**常态自身buff */
export type AlawaySelfBuff = DefineCastCond<"AlawaySelfBuff">;
export const AlawaySelfBuff:DefineCastCondFunc<AlawaySelfBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            condition:genEffectCond('u',spell),
            hook:"BattleUpdate",
            target:'raw',
            force_vaild_target:['self'],
        },{
            condition:genEffectCond('u',spell),
            hook:"SlowUpdate",
            target:'raw',
            force_vaild_target:['self'],
        }],
        one_in_chance:2,
        weight:1,
    }
    return dat;
}

/**战斗自身buff */
export type BattleSelfBuff = DefineCastCond<"BattleSelfBuff">;
export const BattleSelfBuff:DefineCastCondFunc<BattleSelfBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:{
            condition:genEffectCond('u',spell),
            hook:"BattleUpdate",
            target:'raw',
            force_vaild_target:['self'],
        },
        one_in_chance:2,
        weight:1,
    }
    return dat;
}

/**条件触发的常态自身buff */
export type AlawaySelfBuffCond = DefineCastCond<"AlawaySelfBuffCond",{
    /**触发条件 u 为自身 n 不存在 */
    condition:(BoolExpr)
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
        }],
        one_in_chance:2,
        weight:1,
    }
}

/**条件触发的非战斗自身buff */
export type NonBattleSelfBuffCond = DefineCastCond<"NonBattleSelfBuffCond",{
    /**触发条件 u 为自身 n 不存在 */
    condition:(BoolExpr)
}>;
export const NonBattleSelfBuffCond:DefineCastCondFunc<NonBattleSelfBuffCond> = (data,spell)=>{
    const {condition} = data;
    return {
        cast_condition:[{
            condition:condition,
            hook:"NonBattleSlowUpdate",
            target:'raw',
            force_vaild_target:['self'],
        }],
        one_in_chance:2,
    }
}

/**条件触发的战斗自身buff */
export type BattleSelfBuffCond = DefineCastCond<"BattleSelfBuffCond",{
    /**触发条件 u 为自身 n 不存在 */
    condition:(BoolExpr)
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
//#endregion


//#region 目标buff

/**常态目标buff */
export type AlawayTargetBuff = DefineCastCond<"AlawayTargetBuff">;
export const AlawayTargetBuff:DefineCastCondFunc<AlawayTargetBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            condition:genEffectCond('n',spell),
            hook:"BattleUpdate",
            target:"filter_random"
        },{
            condition:genEffectCond('n',spell),
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

/**战斗目标buff */
export type BattleTargetBuff = DefineCastCond<"BattleTargetBuff">;
export const BattleTargetBuff:DefineCastCondFunc<BattleTargetBuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            condition:genEffectCond('n',spell),
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

/**条件触发的战斗目标buff */
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

//#endregion


//战斗距离
const BattleRange = 20;
/**召唤怪物 */
export type BattleSummonMonster = DefineCastCond<"BattleSummonMonster">;
export const BattleSummonMonster:DefineCastCondFunc<BattleSummonMonster> = (data,spell)=>{
    const {effect,effect_str} = spell;
    if(effect!='summon')
        throw `${spell.name} 不是召唤效果, 不能使用BattleSummonMonster, 考虑BattleSummonMonsterCond`;
    return {
        cast_condition:[{
            hook:"None",
            target:"control_cast",
        },{
            hook:"BattleUpdate",
            target:"raw",
            condition:{math:[
                JM.monstersNearby('u',[`'${effect_str}'`],{radius:`${BattleRange}`,attitude:"'friendly'"}),'<=','0'
            ]},
        }],
        one_in_chance:2,
    }

}