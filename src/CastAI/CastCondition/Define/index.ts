import { Inherit } from '.';
import { ControlCast } from '.';
import { ItemCast } from '.';
import { MeleeTargetDamage, RangeTargetDamage, SelfAoeDamage, TargetDamage, TargetDebuff } from './TryAttack';
import { AlawaySelfBuff, AlawaySelfBuffCond, AlawayTargetBuff, BattleSelfBuff, BattleSelfBuffCond, BattleTargetBuff, BattleTargetBuffCond } from './Update';

export * from './Other';
export * from './TryAttack';
export * from './Update';

/**施法条件函数表 */
export const CastCondFuncTable = {
    SelfAoeDamage,
    TargetDamage,
    TargetDebuff,
    MeleeTargetDamage,
    RangeTargetDamage,
    BattleSelfBuff,
    AlawaySelfBuff,
    BattleTargetBuff,
    AlawayTargetBuff,
    AlawaySelfBuffCond,
    BattleSelfBuffCond,
    BattleTargetBuffCond,
    ItemCast,
    Inherit,
    ControlCast,
}

/**施法条件数据表 */
export type CastCondDataTable = {
    SelfAoeDamage        : SelfAoeDamage        ;
    TargetDamage         : TargetDamage         ;
    TargetDebuff         : TargetDebuff         ;
    MeleeTargetDamage    : MeleeTargetDamage    ;
    RangeTargetDamage    : RangeTargetDamage    ;
    BattleSelfBuff       : BattleSelfBuff       ;
    AlawaySelfBuff       : AlawaySelfBuff       ;
    BattleTargetBuff     : BattleTargetBuff     ;
    AlawayTargetBuff     : AlawayTargetBuff     ;
    AlawaySelfBuffCond   : AlawaySelfBuffCond   ;
    BattleSelfBuffCond   : BattleSelfBuffCond   ;
    BattleTargetBuffCond : BattleTargetBuffCond ;
    ItemCast             : ItemCast             ;
    Inherit              : Inherit              ;
    ControlCast          : ControlCast          ;
}