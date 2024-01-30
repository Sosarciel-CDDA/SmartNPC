import { EocID, NoParamTalkerCondList, Spell } from "cdda-schema";
import { JToken } from "@zwa73/utils";
import { SADef } from "@src/SADefine";
import { CastCond } from "./CastAIInterface";

//翻转u与n
export function revTalker<T extends JToken>(obj:T):T{
    let str = JSON.stringify(obj)
        .replace(/"u_(\w+?)":/g  , '"tmpnpctmp_$1":')
        .replace(/(?<!\w)u_/g    , 'tmpntmp_'       )
        .replace(/"npc_(\w+?)":/g, '"u_$1":'        )
        .replace(/(?<!\w)n_/g    , 'u_'             )
        .replace(/tmpnpctmp_/g   , 'npc_'           )
        .replace(/tmpntmp_/g     , 'n_'             );

    //修正无参条件
    const npcond = NoParamTalkerCondList.join('|');
    const regex = new RegExp(`"n_(${npcond})"`,'g');
    str = str.replace(regex,`"npc_$1"`);
    return JSON.parse(str);
}

/**解析NumObj为math表达式 */
export function parseNumObj(value?:any){
    let strExp = `0`;
    if(value!==undefined){
        if(typeof value == "number")
            strExp = value+"";
        else if(typeof value == "object" && "math" in value)
            strExp = value.math[0];
        else throw `伤害解析只支持固定值number 或 math表达式`
    }
    return strExp;
}
/**解析法术伤害字符串 */
export function parseSpellNumObj(spell:Spell,field:keyof Spell,def?:number){
    if(def != undefined && spell[field]===undefined) return def+"";
    return parseNumObj(spell[field]);
}
/**生成施法eocid */
export function genCastEocID(spell:Spell,cast_condition:CastCond):EocID{
    return SADef.genEOCID(`Cast${spell.id}_${cast_condition.id}`);
}
/**生成施法true_eoc id */
export function genTrueEocID(spell:Spell,cast_condition:CastCond):EocID{
    return SADef.genEOCID(`${spell.id}TrueEoc_${cast_condition.id}`)
}
/**使某个技能停止使用的变量 */
export function getDisableSpellVar(talker:"u"|"n",spell:Spell){
    return `${talker}_${spell.id}_switch_disable`;
}