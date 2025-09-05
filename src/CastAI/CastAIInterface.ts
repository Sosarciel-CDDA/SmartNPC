import { CharHook } from "@sosarciel-cdda/event";
import { BoolExpr, EocEffect, NumberExpr, Spell, SpellID } from "@sosarciel-cdda/schema";
import { DefCastData } from "./DefData";

/**技能选择目标类型 列表 */
export const TargetTypeList = [
    "auto"          ,//自动
    "random"        ,//原版随机
    "direct_hit"    ,//直接命中交互单位 u为角色 n为受害者 hook必须为InteractiveCharEvent
    "filter_random" ,//筛选目标随机 u为角色 n为受害者 处理时翻转
    "control_cast"  ,//玩家控制施法
]as const;
/**技能选择目标类型  
 * auto 为 根据施法目标自动选择;  
 *  
 * random 为 原版随机 适用于自身buff 若作为伤害将会击中任何有效目标;  
 *  
 * direct_hit 为 直接命中交互单位 适用于任何目标技能  
 * hook 必须为互动事件  
 *  
 * filter_random 为根据条件筛选可能的目标 命中第一个通过筛选的目标 条件中u为施法者n为目标 适用于队友buff;  
 *  
 * control_cast 为玩家控制施法 u 为玩家 n 为npc hook字段无效 全局变量 `${spell.id}_control_cast_loc` 为玩家选择坐标
 *  
 * 默认为auto  
 * 若允许多个cast_condition 请指定具体type  
 * 相同的hook与target(包括auto或未指定)将覆盖  
 */
export type TargetType = typeof TargetTypeList[number];

/**数据表 技能ID : 施法数据
*/
export type CastAIDataTable = {
    /**技能ID : 施法数据 */
    [key:string]:(RawCastAIData)
};
/**json格式  */
export type CastAIDataJsonTable = {
    /**需求mod */
    require_mod?:string;
    /**共同条件 */
    common_condition?:(BoolExpr);
    /**数据表 技能ID : 施法数据 */
    table:(CastAIDataTable);
};

/**施法数据 */
export type CastAIData = {
    /**目标法术ID 默认为键值 */
    id?              :SpellID;
    /**技能的释放条件 */
    cast_condition   :CastCond|CastCond[];
    /**共同条件 与cast_condition相与 */
    common_condition?:(BoolExpr);
    /**合并条件 用于辅助event合并的条件 无需填写 */
    merge_condition?:(BoolExpr);
    /**权重 优先尝试触发高权重的spell 取值范围 -99 ~ 99 默认0 */
    weight?          :number;
    /**概率 有1/chance的几率使用这个技能 默认1 */
    one_in_chance?   :number;
    /**冷却时间 单位为每次CharUpdate 默认0 */
    cooldown?        :number;
    /**共同冷却时间 影响所有技能的释放 单位为每次CharUpdate 默认1  
     * 一个高权重0共同冷却的技能意味着可以同时触发  
     */
    common_cooldown? :number;
    /**释放成功后运行的效果 */
    after_effect?    :EocEffect[];
    /**尝试释放时就运行的效果 */
    before_effect?   :EocEffect[];
    /**强制覆盖的有效目标 适用于random与filter_random */
    force_vaild_target?  : Spell['valid_targets'];
};
/**未处理的施法数据 */
export type RawCastAIData = CastAIData|DefCastData;

/**技能的释放条件 */
export type CastCond={
    /**唯一id 默认为下标 */
    id?             : string;
    /**释放条件 */
    condition?      : (BoolExpr);
    /**时机 */
    hook            : CharHook|"None";
    /**瞄准方式  
     * auto 为 根据施法目标自动选择;  
     *  
     * random 为 原版随机 适用于自身buff;  
     *  
     * direct_hit 为 直接命中交互单位 适用于任何目标技能  
     * hook 必须为互动事件 "CharTakeDamage CharTakeRangeDamage CharTakeMeleeDamage CharSucessMeleeAttack CharCauseRangeHit CharCauseHit";  
     *  
     * filter_random 为根据条件筛选可能的目标 命中第一个通过筛选的目标 条件中u为施法者n为目标 适用于队友buff;  
     *  
     * control_cast 为玩家控制施法 u 为玩家 n 为npc hook字段无效 `${spell.id}_loc` 为玩家选择坐标
     *   
     * 默认为auto  
     */
    target?         : TargetType;
    /**释放成功后运行的效果 */
    after_effect?   : EocEffect[];
    /**尝试释放时就运行的效果 */
    before_effect?  : EocEffect[];
    /**忽略能量消耗 */
    ignore_cost?    : boolean;
    /**忽略经验增长 */
    infoge_exp?     : boolean;
    /**不检查是否学会, 强制使用某个法术等级 */
    force_lvl?      : (NumberExpr);
    /**此条件的独立权重 取值范围 -99 ~ 99 默认0 */
    weight?         : number;
    /**在 n 秒没有成功施法后才会启用此条件 */
    fallback_with?  : number;
    /**强制覆盖的有效目标 适用于random与filter_random */
    force_vaild_target?  : Spell['valid_targets'];
}

/**基础技能数据 */
export type CastProcData = Readonly<{
    /**技能 */
    skill:CastAIData;
    /**基础释放eoc条件 */
    base_cond: (BoolExpr)[];
    /**基础成功eoc效果 */
    after_effect:EocEffect[];
    /**基础准备释放Eoc */
    before_effect:EocEffect[];
    /**释放条件 */
    cast_condition:CastCond;
    /**施法等级 */
    min_level:NumberExpr;
    /**覆盖的有效目标 */
    force_vaild_target?:Spell['valid_targets'];
}>