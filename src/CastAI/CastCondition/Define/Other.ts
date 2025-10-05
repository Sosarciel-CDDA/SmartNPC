import { ItemID } from "@sosarciel-cdda/schema";
import { DefineCastCond, DefineCastCondFunc } from "../Interface";
import { CastCondDefineDataTable, CastCondDefineTable } from "./index";
import { CastAIData, CastCond } from "../../Interface";


type InheritAble = Omit<CastCondDefineDataTable,'ItemCast'|'Inherit'>;

/**物品充能释放 */
export type ItemCast = DefineCastCond<"ItemCast",{
    /**基于哪种基础类型 */
    base:InheritAble[keyof InheritAble];
    /**物品ID */
    item_id:ItemID;
    /**消耗的充能 默认1 */
    charge?:number;
    /**消耗物品而非充能 默认false */
    consume_item?:boolean;
    /**强制使用某个法术等级 默认使用已知等级 */
    force_lvl?:number;
}>;
export const ItemCast:DefineCastCondFunc<ItemCast> = (data,spell)=>{
    const dtype = typeof data.base == "string" ? data.base : data.base.type;
    const base = (CastCondDefineTable as any)[dtype](data.base,spell);
    const conds:CastCond[] = Array.isArray(base.cast_condition) ? base.cast_condition : [base.cast_condition];
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
}


/**从基础继承 */
export type Inherit = DefineCastCond<"Inherit",{
    /**从基础继承 */
    type:"Inherit";
    /**基于哪种基础类型 */
    base:InheritAble[keyof InheritAble];
}&Partial<CastAIData>>;
export const Inherit:DefineCastCondFunc<Inherit> = (data,spell)=>{
    const dtype = typeof data.base == "string" ? data.base : data.base.type;
    const baseObj = (CastCondDefineTable as any)[dtype](data.base,spell);
    const {type,base,...rest} = data;
    return Object.assign({},baseObj,rest);
}

/**控制施法 */
export type ControlCast = DefineCastCond<"ControlCast">;
export const ControlCast:DefineCastCondFunc<ControlCast> = ()=>{
    return {
        cast_condition:{
            hook:"None",
            target:"control_cast"
        }
    }
}