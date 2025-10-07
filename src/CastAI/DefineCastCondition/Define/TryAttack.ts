import { BoolExpr, JM } from "@sosarciel-cdda/schema";
import { CastAIData } from "../../Interface";
import { DefineCastCond, DefineCastCondFunc } from "../Interface";
import { concentratedDamageCast, genEffectCond, randomDamageCast } from "../Util";
import { getAoeExpr } from "../../UtilFunc";


/**目标伤害 */
export type TargetDamage = DefineCastCond<"TargetDamage">;
export const TargetDamage:DefineCastCondFunc<TargetDamage> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            hook:"TryAttack",
        },
        randomDamageCast(spell),
        concentratedDamageCast(spell),
        {
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
    }
    return dat;
}


/**近战目标伤害 */
export type MeleeTargetDamage = DefineCastCond<"MeleeTargetDamage">;
export const MeleeTargetDamage:DefineCastCondFunc<MeleeTargetDamage> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            hook:"TryMeleeAttack",
        },
        randomDamageCast(spell),
        concentratedDamageCast(spell),
        {
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
    }
    return dat;
}

/**远程目标伤害 */
export type RangeTargetDamage = DefineCastCond<"RangeTargetDamage">;
export const RangeTargetDamage:DefineCastCondFunc<RangeTargetDamage> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            hook:"TryRangeAttack",
        },
        randomDamageCast(spell),
        concentratedDamageCast(spell),
        {
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
    }
    return dat;
}


/**目标debuff */
export type TargetDebuff = DefineCastCond<"TargetDebuff">;
export const TargetDebuff:DefineCastCondFunc<TargetDebuff> = (data,spell)=>{
    const dat:CastAIData = {
        cast_condition:[{
            hook:"TryAttack",
        },
        randomDamageCast(spell,genEffectCond('n',spell)),
        concentratedDamageCast(spell,genEffectCond('n',spell)),
        {
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
    }
    return dat;
}

/**条件触发的目标debuff */
export type TargetDebuffCond = DefineCastCond<"TargetDebuffCond",{
    /**触发条件 u 为自身 n 为目标 */
    condition:(BoolExpr);
}>;
export const TargetDebuffCond:DefineCastCondFunc<TargetDebuffCond> = (data,spell)=>{
    const {condition} = data;
    const dat:CastAIData = {
        cast_condition:[{
            hook:"TryAttack",
        },
        randomDamageCast(spell,condition),
        concentratedDamageCast(spell,condition),
        {
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
    }
    return dat;
}


/**自身半径AOE伤害 */
export type SelfAoeDamage = DefineCastCond<"SelfAoeDamage">;
export const SelfAoeDamage:DefineCastCondFunc<SelfAoeDamage> = (data,spell)=>{
    const aoeexpr = getAoeExpr(spell);
    const dat:CastAIData = {
        cast_condition:[{
            hook:"TryMeleeAttack",
        },{
            hook:"BattleUpdate",
            target:"raw",
            condition:{math:[
                JM.monstersNearby('u',[],{radius:`(${aoeexpr}) / 2`,attitude:"'hostile'"}),'>=','1'
            ]}
        },
        {
            hook:"None",
            target:"control_cast",
        }],
        one_in_chance:2,
    }
    return dat;
}