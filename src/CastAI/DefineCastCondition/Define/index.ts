import { Inherit } from '.';
import { ControlCast } from '.';
import { ItemCast } from '.';
import { MeleeTargetDamage, RangeTargetDamage, SelfAoeDamage, TargetDamage, TargetDebuff, TargetDebuffCond } from './TryAttack';
import { AlawaySelfBuff, AlawaySelfBuffCond, AlawayTargetBuff, BattleSelfBuff, BattleSelfBuffCond, BattleSummonMonster, BattleTargetBuff, BattleTargetBuffCond, NonBattleSelfBuffCond } from './Update';

export * from './Other';
export * from './TryAttack';
export * from './Update';

/**施法条件函数表 */
export const CastCondFuncTable = {
    TargetDamage         ,
    TargetDebuff         ,
    MeleeTargetDamage    ,
    RangeTargetDamage    ,
    SelfAoeDamage        ,

    AlawaySelfBuff       ,
    BattleSelfBuff       ,
    AlawaySelfBuffCond   ,
    NonBattleSelfBuffCond,
    BattleSelfBuffCond   ,
    AlawayTargetBuff     ,
    BattleTargetBuff     ,
    BattleTargetBuffCond ,
    BattleSummonMonster  ,

    ItemCast             ,
    Inherit              ,
    ControlCast          ,
    TargetDebuffCond     ,
}

/**施法条件数据表 */
export type CastCondDataTable = {
    TargetDamage         : TargetDamage         ;
    TargetDebuff         : TargetDebuff         ;
    MeleeTargetDamage    : MeleeTargetDamage    ;
    RangeTargetDamage    : RangeTargetDamage    ;
    SelfAoeDamage        : SelfAoeDamage        ;

    AlawaySelfBuff       : AlawaySelfBuff       ;
    BattleSelfBuff       : BattleSelfBuff       ;
    AlawaySelfBuffCond   : AlawaySelfBuffCond   ;
    NonBattleSelfBuffCond: NonBattleSelfBuffCond;
    BattleSelfBuffCond   : BattleSelfBuffCond   ;
    AlawayTargetBuff     : AlawayTargetBuff     ;
    BattleTargetBuff     : BattleTargetBuff     ;
    BattleTargetBuffCond : BattleTargetBuffCond ;
    BattleSummonMonster  : BattleSummonMonster  ;

    ItemCast             : ItemCast             ;
    Inherit              : Inherit              ;
    ControlCast          : ControlCast          ;
    TargetDebuffCond     : TargetDebuffCond     ;
}