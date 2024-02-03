import { AnyItemID, Effect, Spell, SpellID } from "cdda-schema";
import { CastAIData } from "./CastAIInterface";
import { SADef, getSpellByID } from "@src/SADefine";




/**无参预定义的施法数据 列表 */
export const NoParamDefCastDataList = [
    "TargetDamage"      ,//目标伤害
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
    item_id:AnyItemID;
    /**消耗的充能 默认1 */
    charge?:number;
    /**消耗物品而非充能 默认false */
    consume_item?:boolean;
    /**强制使用某个法术等级 默认使用已知等级 */
    force_lvl?:number;
}
/**预定义的施法数据 */
export type ObjDefCastData = [
    ItemCast
][number];

/**预定义的施法数据 */
export type DefCastData = NoParamDefCastData|ObjDefCastData;
/**预定义的施法数据类型 */
export type DefCastDataType = NoParamDefCastData|ObjDefCastData["type"];

/**施法数据生成器 */
type DefCastDataGener = (data:DefCastData,spell:Spell)=>CastAIData;


//集火标记
export const ConcentratedAttack:Effect={
    type:"effect_type",
    id:SADef.genEffectID("ConcentratedAttack"),
    name:["被集火"],
    desc:["被集火"],
}

/**施法数据生成器 表 */
const DefCastDataMap:Record<DefCastDataType,DefCastDataGener> = {
    TargetDamage(data:DefCastData,spell:Spell){
        const dat:CastAIData = {
            cast_condition:[{
                hook:"TryAttack",
            },{
                hook:"BattleUpdate",
                target:"filter_random",
                condition:{math:[`n_effect_intensity('${ConcentratedAttack.id}')`,">","0"]},
                fallback_with:5,
            },{
                hook:"BattleUpdate",
                target:"random",
                fallback_with:10,
            },{
                hook:"TryAttack",
                target:"control_cast",
            }],
            one_in_chance:2,
        }
        return dat;
    },
    BattleSelfBuff(data:DefCastData,spell:Spell){
        const dat:CastAIData = {
            cast_condition:{
                condition:{math:[`u_effect_intensity('${spell.effect_str}')`,"<","1"]},
                hook:"BattleUpdate"
            },
            one_in_chance:2,
            weight:1,
        }
        return dat;
    },
    AlawaySelfBuff(data:DefCastData,spell:Spell){
        const dat:CastAIData = {
            cast_condition:[{
                condition:{math:[`u_effect_intensity('${spell.effect_str}')`,"<","1"]},
                hook:"BattleUpdate"
            },{
                condition:{math:[`u_effect_intensity('${spell.effect_str}')`,"<","1"]},
                hook:"SlowUpdate"
            }],
            one_in_chance:2,
            weight:1,
        }
        return dat;
    },
    BattleTargetBuff(data:DefCastData,spell:Spell){
        const dat:CastAIData = {
            cast_condition:[{
                condition:{math:[`n_effect_intensity('${spell.effect_str}')`,"<","1"]},
                hook:"BattleUpdate",
                target:"filter_random"
            },{
                hook:"TryAttack",
                target:"control_cast",
            }],
            one_in_chance:2,
            weight:1,
        }
        return dat;
    },
    AlawayTargetBuff(data:DefCastData,spell:Spell){
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
                hook:"TryAttack",
                target:"control_cast",
            }],
            one_in_chance:2,
            weight:1,
        }
        return dat;
    },
    ItemCast(data:DefCastData,spell:Spell){
        data = data as ItemCast;
        const base = DefCastDataMap[data.base](data.base,spell);
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
}
/**根据预定义的ID获得预定义施法数据 */
export function getDefCastData(data:DefCastData|CastAIData,spellid:SpellID):CastAIData{
    let dtype:DefCastDataType|undefined=undefined;
    if(typeof data === "object" && "type" in data) dtype = data.type;
    else if(typeof data === "string") dtype = data;

    if(DefCastDataMap[dtype!]!==undefined)
        return DefCastDataMap[dtype!](data as DefCastData,getSpellByID(spellid));
    return data as any;
}