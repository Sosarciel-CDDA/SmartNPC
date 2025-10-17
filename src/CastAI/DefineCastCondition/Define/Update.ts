import { BoolExpr, JM } from "@sosarciel-cdda/schema";
import { CastAIData } from "../../Interface";
import { DefineCastCond, DefineCastCondFunc } from "../Interface";
import { concentratedDamageCast, genEffectCond, randomDamageCast } from "../Util";
import { getAoeExpr } from "../../UtilFunc";

//#region 自身buff

type BuffCond = {
    /**触发条件 u 为自身 n TargetBuff时为目标 SelfBuff时不存在 */
    condition:(BoolExpr);
    /**权重 默认1 */
    weight?:number;
}

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
export type AlawaySelfBuffCond = DefineCastCond<"AlawaySelfBuffCond",BuffCond>;
export const AlawaySelfBuffCond:DefineCastCondFunc<AlawaySelfBuffCond> = (data,spell)=>{
    const {
        condition,
        weight = 1,
    } = data;
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
        weight:weight,
    }
}

/**条件触发的非战斗自身buff */
export type NonBattleSelfBuffCond = DefineCastCond<"NonBattleSelfBuffCond",BuffCond>;
export const NonBattleSelfBuffCond:DefineCastCondFunc<NonBattleSelfBuffCond> = (data,spell)=>{
    const {
        condition,
        weight = 1,
    } = data;
    return {
        cast_condition:[{
            condition:condition,
            hook:"NonBattleSlowUpdate",
            target:'raw',
            force_vaild_target:['self'],
        }],
        one_in_chance:2,
        weight:weight,
    }
}

/**条件触发的战斗自身buff */
export type BattleSelfBuffCond = DefineCastCond<"BattleSelfBuffCond",BuffCond>;
export const BattleSelfBuffCond:DefineCastCondFunc<BattleSelfBuffCond> = (data,spell)=>{
    const {
        condition,
        weight = 1,
    } = data;
    return {
        cast_condition:[{
            condition:condition,
            hook:"BattleUpdate",
            target:'raw',
            force_vaild_target:['self'],
        }],
        one_in_chance:2,
        weight:weight,
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

/**常态目标buff */
export type AlawayTargetBuffCond = DefineCastCond<"AlawayTargetBuffCond",BuffCond>;
export const AlawayTargetBuffCond:DefineCastCondFunc<AlawayTargetBuffCond> = (data,spell)=>{
    const {
        condition,
        weight = 1,
    } = data;
    const dat:CastAIData = {
        cast_condition:[{
            condition:condition,
            hook:"BattleUpdate",
            target:"filter_random"
        },{
            condition:condition,
            hook:"SlowUpdate",
            target:"filter_random"
        },{
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
        weight:weight,
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
export type BattleTargetBuffCond = DefineCastCond<"BattleTargetBuffCond",BuffCond>;
export const BattleTargetBuffCond:DefineCastCondFunc<BattleTargetBuffCond> = (data,spell)=>{
    const {
        condition,
        weight = 1,
    } = data;
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
        weight:weight,
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

/**目标治疗 */
export type TargetHeal = DefineCastCond<"TargetHeal">;
export const TargetHeal:DefineCastCondFunc<TargetHeal> = (data,spell)=>{
    return {
        cast_condition: [{
            hook: "BattleUpdate",
            condition: { or: [
                { math: ["n_hp('torso')", "<=", "n_hp_max('torso')/3"] },
                { math: ["n_hp('head')", "<=", "n_hp_max('head')/3"] }
            ]}
        },{
            hook: "SlowUpdate",
            condition: { or: [
                { math: ["N_SumMaxHp()-N_SumHp()", ">", "10"] },
                { math: ["n_hp('torso')", "<=", "n_hp_max('torso')/3"] },
                { math: ["n_hp('head')", "<=", "n_hp_max('head')/3"] }
            ]}
        },{
            hook:"None",
            target:"control_cast",
        }],
        weight: -1
    }
}

/**自身治疗 */
export type SelfHeal = DefineCastCond<"SelfHeal">;
export const SelfHeal:DefineCastCondFunc<SelfHeal> = (data,spell)=>{
    return {
        cast_condition: [{
            hook: "BattleUpdate",
            condition: { or: [
                { math: ["u_hp('torso')", "<=", "u_hp_max('torso')/3"] },
                { math: ["u_hp('head')", "<=", "u_hp_max('head')/3"] }
            ]}
        },{
            hook: "SlowUpdate",
            condition: { or: [
                { math: ["U_SumMaxHp() - U_SumHp()", ">", "10"] },
                { math: ["u_hp('torso')", "<=", "u_hp_max('torso')/3"] },
                { math: ["u_hp('head')", "<=", "u_hp_max('head')/3"] }
            ]}
        }],
        weight: -1
    }
}