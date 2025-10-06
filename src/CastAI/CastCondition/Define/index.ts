import { Inherit } from '.';
import { ControlCast } from '.';
import { ItemCast } from '.';
import { MeleeTargetDamage, RangeTargetDamage, TargetDamage, TargetDebuff, TargetDebuffCond } from './TryAttack';
import { AlawaySelfBuff, AlawaySelfBuffCond, AlawayTargetBuff, BattleSelfAoeDamage, BattleSelfBuff, BattleSelfBuffCond, BattleSummonMonster, BattleTargetBuff, BattleTargetBuffCond } from './Update';

export * from './Other';
export * from './TryAttack';
export * from './Update';

/**施法条件函数表 */
export const CastCondFuncTable = {
    TargetDamage         ,
    TargetDebuff         ,
    MeleeTargetDamage    ,
    RangeTargetDamage    ,
    AlawaySelfBuff       ,

    BattleSelfBuff       ,
    AlawaySelfBuffCond   ,
    BattleSelfBuffCond   ,
    AlawayTargetBuff     ,
    BattleTargetBuff     ,
    BattleTargetBuffCond ,
    BattleSelfAoeDamage  ,
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

    AlawaySelfBuff       : AlawaySelfBuff       ;
    BattleSelfBuff       : BattleSelfBuff       ;
    AlawaySelfBuffCond   : AlawaySelfBuffCond   ;
    BattleSelfBuffCond   : BattleSelfBuffCond   ;
    AlawayTargetBuff     : AlawayTargetBuff     ;
    BattleTargetBuff     : BattleTargetBuff     ;
    BattleTargetBuffCond : BattleTargetBuffCond ;
    BattleSelfAoeDamage  : BattleSelfAoeDamage  ;
    BattleSummonMonster  : BattleSummonMonster  ;

    ItemCast             : ItemCast             ;
    Inherit              : Inherit              ;
    ControlCast          : ControlCast          ;
    TargetDebuffCond     : TargetDebuffCond     ;
}