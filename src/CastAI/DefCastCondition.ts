import { BoolExpr, Effect, EffectID, ItemID, Spell, SpellID } from "@sosarciel-cdda/schema";
import { CastAIData, CastCond } from "./Interface";
import { SADef, getSpellByID } from "@/src/Define";
import { getAoeExpr } from "./UtilFunc";




/**无参预定义的施法数据 列表 */
const NoParamDefCastDataList = [
    "TargetDamage"           ,//目标伤害
    "MeleeTargetDamage"      ,//近战目标伤害
    "RangeTargetDamage"      ,//远程目标伤害
    "BattleSelfBuff"         ,//战斗自身buff
    "AlawaySelfBuff"         ,//常态自身buff
    "BattleTargetBuff"       ,//战斗目标buff
    "AlawayTargetBuff"       ,//常态目标buff
    "SelfAoeDamage"          ,//自身半径AOE伤害
] as const;

/**无参预定义的施法数据 */
type NoParamDefCastData = typeof NoParamDefCastDataList[number];

/**物品充能释放 */
type ItemCast = {
    type:"ItemCast";
    /**基于哪种基础类型 */
    base:NoParamDefCastData;
    /**物品ID */
    item_id:ItemID;
    /**消耗的充能 默认1 */
    charge?:number;
    /**消耗物品而非充能 默认false */
    consume_item?:boolean;
    /**强制使用某个法术等级 默认使用已知等级 */
    force_lvl?:number;
}

/**条件触发的自身buff */
type AlawaySelfBuffCond = {
    type:"AlawaySelfBuffCond";
    /**触发条件 u 为自身 n 不存在 */
    condition:(BoolExpr);
}

/**条件触发的自身buff */
type BattleSelfBuffCond = {
    type:"BattleSelfBuffCond";
    /**触发条件 u 为自身 n 不存在 */
    condition:(BoolExpr);
}

/**从基础继承 */
type Inherit = {
    /**从基础继承 */
    type:"Inherit";
    /**基于哪种基础类型 */
    base:NoParamDefCastData;
}&Partial<CastAIData>;

/**预定义的施法数据 */
type ParamCastData = [
    ItemCast,
    AlawaySelfBuffCond,
    BattleSelfBuffCond,
    Inherit
][number];

/**预定义的施法数据 */
export type DefCastData = NoParamDefCastData|ParamCastData;
/**预定义的施法数据类型 */
export type DefCastDataType = NoParamDefCastData|ParamCastData["type"];

/**施法数据生成器 */
type DefCastDataGener<T extends DefCastData|undefined> = (data:T,spell:Spell)=>CastAIData;


//集火标记
export const ConcentratedAttack:Effect={
    type:"effect_type",
    id:SADef.genEffectID("ConcentratedAttack"),
    show_in_info:true,
    name:["被集火"],
    desc:["被集火"],
}

//生成2次回退的随机释放条件
const randomDamageCast = (spell:Spell):CastCond=>{
    //如果可能伤害自己则计算距离
    if(spell.min_aoe!=undefined && spell.valid_targets.includes('self') && spell.shape=="blast"){
        return {
            hook:"BattleUpdate",
            target:"filter_random",
            condition:{math:[`distance('u', 'npc')`,">",getAoeExpr(spell)]},
            fallback_with:10,
            force_vaild_target:['hostile'],
        }
    }
    return {
        hook:"BattleUpdate",
        target:"random",
        fallback_with:10,
        force_vaild_target:['hostile'],
    }
};

//生成1次回退的筛选随机释放条件
const concentratedDamageCast = (spell:Spell):CastCond=>{
    //如果可能伤害自己则计算距离
    if(spell.min_aoe!=undefined && spell.valid_targets.includes('self') && spell.shape=="blast"){
        return {
            hook:"BattleUpdate",
            target:"filter_random",
            condition:{and:[
                {math:[`n_effect_intensity('${ConcentratedAttack.id}')`,">","0"]},
                {math:[`distance('u', 'npc')`,">",getAoeExpr(spell)]}
            ]},
            fallback_with:10,
            force_vaild_target:['hostile'],
        }
    }
    return {
        hook:"BattleUpdate",
        target:"filter_random",
        condition:{math:[`n_effect_intensity('${ConcentratedAttack.id}')`,">","0"]},
        fallback_with:10,
        force_vaild_target:['hostile'],
    }
};

/**施法数据生成器 表 */
const DefCastDataMap:{
    [K in DefCastDataType]: Extract<DefCastData,{type:K}> extends never
            ? DefCastDataGener<undefined>
            : DefCastDataGener<Extract<DefCastData,{type:K}>>
} = {
    SelfAoeDamage(data,spell){
        const dat:CastAIData = {
            cast_condition:[{
                hook:"TryMeleeAttack",
                target:"raw",
            },
            {
                hook:"None",
                target:"control_cast",
            }],
            one_in_chance:2,
        }
        return dat;
    },
    TargetDamage(data,spell){
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
    },
    MeleeTargetDamage(data,spell){
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
    },
    RangeTargetDamage(data,spell){
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
    },
    BattleSelfBuff(data,spell){
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
    },
    AlawaySelfBuff(data,spell){
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
    },
    BattleTargetBuff(data,spell){
        const affbps = spell.affected_body_parts;

        const dat:CastAIData = {
            cast_condition:[{
                condition:affbps==undefined
                    ? {math:[`n_effect_intensity('${spell.effect_str}')`,"<","1"]}
                    : {or:affbps.map(bp=>({math:[`n_effect_intensity('${spell.effect_str}', 'bodypart': '${bp}')`,"<","1"]}))},
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
    },
    AlawayTargetBuff(data,spell){
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
    },
    ItemCast(data,spell){
        const base = DefCastDataMap[data.base](undefined,spell);
        const conds = Array.isArray(base.cast_condition) ? base.cast_condition : [base.cast_condition];
        conds.forEach((cond)=>{
            data = data as ItemCast;
            //消耗充能
            if(data.consume_item !==true){
                cond.condition = {and:[
                    {math:[`u_val('charge_count', 'item: ${data.item_id}')`,">=",`${data.charge??1}`]},
                    ...cond.condition? [cond.condition] : []
                ]}
                cond.fallback_with = cond.fallback_with!==undefined ? cond.fallback_with : 5;
                cond.after_effect = cond.after_effect??[];
                cond.after_effect.push({u_consume_item:data.item_id,charges:data.charge});
            }//消耗物品
            else{
                cond.condition = {and:[
                    {math:[`u_val('item_count', 'item: ${data.item_id}')`,">=",`${data.charge??1}`]},
                    ...cond.condition? [cond.condition] : []
                ]}
                cond.fallback_with = cond.fallback_with!==undefined ? cond.fallback_with : 5;
                cond.after_effect = cond.after_effect??[];
                cond.after_effect.push({u_consume_item:data.item_id,count:data.charge});
            }
            cond.force_lvl = data.force_lvl;
            cond.ignore_cost = true;
        })
        return base;
    },
    AlawaySelfBuffCond(data,spell){
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
    },
    BattleSelfBuffCond(data,spell){
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
    },
    Inherit(data,spell){
        const baseObj = DefCastDataMap[data.base](undefined,spell);
        const {type,base,...rest} = data;
        return Object.assign({},baseObj,rest);
    }
}
/**根据预定义的ID获得预定义施法数据 */
export function getDefCastData(data:DefCastData|CastAIData,spellid:SpellID):CastAIData{
    const dtype=
        (typeof data === "object" && "type" in data) ? data.type :
        (typeof data === "string") ? data : undefined;

    if(dtype==undefined) return data as any;

    const gener = DefCastDataMap[dtype] as any;
    return gener(data,getSpellByID(spellid));
}