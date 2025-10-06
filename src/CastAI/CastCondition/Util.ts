import { BoolExpr, Effect, Spell } from "@sosarciel-cdda/schema";
import { CastCond } from "../Interface";
import { getAoeExpr } from "../UtilFunc";
import { SADef } from "@/src/Define";


//集火标记
export const ConcentratedAttack:Effect={
    type:"effect_type",
    id:SADef.genEffectID("ConcentratedAttack"),
    show_in_info:true,
    name:["被集火"],
    desc:["被集火"],
}

//生成2次回退的随机释放条件
export const randomDamageCast = (spell:Spell,cond?:BoolExpr):CastCond=>{
    //如果可能伤害自己则计算距离
    if(spell.min_aoe!=undefined && spell.valid_targets.includes('self') && spell.shape=="blast"){
        return {
            hook:"BattleUpdate",
            target:"filter_random",
            condition:{and:[
                {math:[`distance('u', 'npc')`,">",getAoeExpr(spell)]},
                ... (cond ? [cond] : []),
            ]},
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
export const concentratedDamageCast = (spell:Spell,cond?:BoolExpr):CastCond=>{
    //如果可能伤害自己则计算距离
    if(spell.min_aoe!=undefined && spell.valid_targets.includes('self') && spell.shape=="blast"){
        return {
            hook:"BattleUpdate",
            target:"filter_random",
            condition:{and:[
                {math:[`n_effect_intensity('${ConcentratedAttack.id}')`,">","0"]},
                {math:[`distance('u', 'npc')`,">",getAoeExpr(spell)]},
                ... (cond ? [cond] : []),
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

//生成buff条件
export const genEffectCond = (talker:'u'|'n',spell:Spell)=>{
    const affbps = spell.affected_body_parts;
    return (affbps==undefined
        ? {math:[`${talker}_effect_intensity('${spell.effect_str}')`,"<","1"]}
        : {or:affbps.map(bp=>({math:[`${talker}_effect_intensity('${spell.effect_str}', 'bodypart': '${bp}')`,"<","1"]}))}) satisfies BoolExpr;
}