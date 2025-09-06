import { Effect, ItemID, Mutation, Spell, SpellID } from "@sosarciel-cdda/schema";
import { CastAIData } from "./CastAIInterface";
import { SADef, getSpellByID } from "@/src/SADefine";




/**无参预定义的施法数据 列表 */
export const NoParamDefCastDataList = [
    "TargetDamage"      ,//目标伤害
    "MeleeTargetDamage" ,//近战目标伤害
    "RangeTargetDamage" ,//远程目标伤害
    "BattleSelfBuff"    ,//战斗自身buff
    "AlawaySelfBuff"    ,//常态自身buff
    "BattleTargetBuff"  ,//战斗目标buff
    "AlawayTargetBuff"  ,//常态目标buff
] as const;

/**无参预定义的施法数据 */
export type NoParamDefCastData = typeof NoParamDefCastDataList[number];

/**物品充能释放 */
export type ItemCast = {
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
/**从基础继承 */
export type Inherit = {
    /**从基础继承 */
    type:"Inherit";
    /**基于哪种基础类型 */
    base:NoParamDefCastData;
}&Partial<CastAIData>;

/**预定义的施法数据 */
export type ObjDefCastData = [
    ItemCast,
    Inherit
][number];

/**预定义的施法数据 */
export type DefCastData = NoParamDefCastData|ObjDefCastData;
/**预定义的施法数据类型 */
export type DefCastDataType = NoParamDefCastData|ObjDefCastData["type"];

/**施法数据生成器 */
type DefCastDataGener<T extends DefCastData|undefined> = (data:T,spell:Spell)=>CastAIData;


//集火标记
export const ConcentratedAttack:Effect={
    type:"effect_type",
    id:SADef.genEffectID("ConcentratedAttack"),
    name:["被集火"],
    desc:["被集火"],
}

type b = Extract<DefCastData,"nul">;
type e = Extract<DefCastData,{type:"Inherit"}>
type a = b extends string ? 1 : 0;
type c = e extends never ? 1 : 2;
/**施法数据生成器 表 */
const DefCastDataMap:{
    [K in DefCastDataType]: Extract<DefCastData,{type:K}> extends never
            ? DefCastDataGener<undefined>
            : DefCastDataGener<Extract<DefCastData,{type:K}>>
} = {
    TargetDamage(data,spell){
        const dat:CastAIData = {
            cast_condition:[{
                hook:"TryAttack",
            },{
                hook:"BattleUpdate",
                target:"filter_random",
                condition:{math:[`n_effect_intensity('${ConcentratedAttack.id}')`,">","0"]},
                force_vaild_target:['hostile'],
                fallback_with:5,
            },
            {
                hook:"BattleUpdate",
                target:"random",
                fallback_with:10,
                force_vaild_target:['hostile'],
            },
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
            },{
                hook:"BattleUpdate",
                target:"filter_random",
                condition:{math:[`n_effect_intensity('${ConcentratedAttack.id}')`,">","0"]},
                fallback_with:5,
                force_vaild_target:['hostile'],
            },
            {
                hook:"BattleUpdate",
                target:"random",
                fallback_with:10,
                force_vaild_target:['hostile'],
            },
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
            },{
                hook:"BattleUpdate",
                target:"filter_random",
                condition:{math:[`n_effect_intensity('${ConcentratedAttack.id}')`,">","0"]},
                fallback_with:5,
                force_vaild_target:['hostile'],
            },
            {
                hook:"BattleUpdate",
                target:"random",
                fallback_with:10,
                force_vaild_target:['hostile'],
            },
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
                target:'random',
                force_vaild_target:['self'],
            },{
                condition:{math:[`u_effect_intensity('${spell.effect_str}')`,"<","1"]},
                hook:"SlowUpdate",
                target:'random',
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
    Inherit(data,spell){
        const baseObj = DefCastDataMap[data.base](undefined,spell);
        const {type,base,...rest} = data;
        for(const k in rest){
            const v = (rest as any)[k];
            if(v!==undefined)
                (baseObj as any)[k] = v;
        }
        return baseObj;
    }
}
/**根据预定义的ID获得预定义施法数据 */
export function getDefCastData(data:DefCastData|CastAIData,spellid:SpellID):CastAIData{
    let dtype:DefCastDataType|undefined=undefined;
    if(typeof data === "object" && "type" in data) dtype = data.type;
    else if(typeof data === "string") dtype = data;

    if(dtype==undefined) return data as any;

    const gener = DefCastDataMap[dtype] as any;
    return gener(data,getSpellByID(spellid));
}