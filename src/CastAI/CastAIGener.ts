import { EocID, Spell } from "@sosarciel-cdda/schema";
import { JToken } from "@zwa73/utils";
import { SADef } from "@src/SADefine";
import { CastAIData, CastCond } from "./CastAIInterface";

//翻转u与n
export function revTalker<T extends JToken>(obj:T):T{
    let str = JSON.stringify(obj)
        .replace(/"u_(\w+?)":/g  , '"tmpnpctmp_$1":')//缓存 eoc
        .replace(/(?<!\w)u_/g    , 'tmpntmp_'       )//缓存 math内置函数
        .replace(/(?<!\w)U_/g    , 'tmpNtmp_'       )//缓存 jmath函数
        .replace(/"npc_(\w+?)":/g, '"u_$1":'        )
        .replace(/(?<!\w)n_/g    , 'u_'             )
        .replace(/(?<!\w)N_/g    , 'U_'             )
        .replace(/tmpnpctmp_/g   , 'npc_'           )
        .replace(/tmpntmp_/g     , 'n_'             )
        .replace(/tmpNtmp_/g     , 'N_'             );

    //修正无参条件
    //const npcond = NoParamTalkerCondList.join('|');
    //const regex = new RegExp(``,'g');
    str = str.replace(/"n_([^()'"]+?)"/g,`"npc_$1"`);
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
    return SADef.genEOCID(`Cast_${spell.id}_${cast_condition.id}`);
}
/**生成施法true_eoc id */
export function genTrueEocID(spell:Spell,cast_condition:CastCond):EocID{
    return SADef.genEOCID(`${spell.id}_TrueEoc_${cast_condition.id}`)
}
/**使某个技能停止使用的变量 */
export function getDisableSpellVar(talker:"u"|"n",spell:Spell){
    return `${talker}_${spell.id}_switch_disable`;
}
/**获得施法的event权重 >0 <1 */
export function getEventWeight(skill:CastAIData,cond:CastCond){
    const weight = cond.weight??skill.weight??0;
    const fixweight = weight/200+0.5;
    if(fixweight > 1 || fixweight < 0) throw `${skill.id} 的 weight: ${weight} 超出施法权重取值范围 -99 ~ 99`;
    return fixweight;
}

export function getSpellCastExp(spell:Spell){
    return `u_spell_level('${spell.id}`
}