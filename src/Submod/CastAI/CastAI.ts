import { JObject } from "@zwa73/utils";
import { SNDef, getSpellByID } from "@/src/Define";
import { SpellEnergySource, EocEffect, NumberExpr, JM, BoolExpr, ModInfo } from "@sosarciel-cdda/schema";
import { CommonModinfo, SPELL_CT_MODMOVE, SPELL_CT_MODMOVE_VAR } from "@/src/Submod/Common";
import { DataManager } from "@sosarciel-cdda/event";
import { getCastTimeExpr, getCDName, getCostExpr, getEnableSpellVar, parseSpellNumObj, uv } from "./UtilFunc";
import { BaseCondTable, CastAIData, CastProcData } from "./Interface";
import { procSpellTarget } from "./TargetProcFunc";
import { ConcentratedAttack } from "./DefineCastCondition";
import { createCastAITalkTopic } from "./TalkTopic";
import { CastAIDataMap, CoCooldownName, FallbackValName, InitedCastSettingName } from "./Define";



//法术消耗变量类型映射
const COST_MAP={
    "BIONIC" : "u_val('power')",
    //"HP"     : "u_hp('torso')",
    "MANA"   : "u_val('mana')",
    //"STAMINA": "u_val('stamina')",
    "NONE"   : undefined,
    "HP"     : "HP",
    "STAMINA": "STAMINA",
} as const;

//法术消耗 使用能量表达式
const useCost = (costType:SpellEnergySource,num:string):EocEffect[]=>{
    const costVar = COST_MAP[costType];
    if(costVar===undefined) return [];

    //if(costType=="STAMINA") //模拟耐力
    //    return [{math:[costVar,'-=',`(${num})/10`]}];

    switch(costVar){
        case "HP":{
            const hplist = ["u_hp('torso')","u_hp('head')","u_hp('leg_l')","u_hp('leg_r')","u_hp('arm_l')","u_hp('arm_r')"];
            return hplist.map(v=>({math:[v,"-=",`(${num})/6`]}))
        }
        case "STAMINA":{
            return [{math:["u_val('mana')",'-=',num]}]
        }
        default:{
            return [{math:[costVar,'-=',num]}];
        }
    }
}
//法术消耗条件
const costCond = (costType:SpellEnergySource,num:string):BoolExpr[]=>{
    const costVar = COST_MAP[costType];
    if(costVar==undefined) return [];
    switch(costVar){
        case "HP":{
            return [{and:[
                {math:["U_SumHp()",">",num]},
                {math:["u_hp('torso')",">",`(${num})/6`]},
                {math:["u_hp('head')" ,">",`(${num})/6`]},
            ]}];
        }
        case "STAMINA":{
            return [{math:["u_val('mana')",'>=',num]}]
        }
        default:{
            return [{math:[costVar,'>=',num]}];
        }
    }
}

export const CastAIModInfo:ModInfo = {
    "type": "MOD_INFO",
    id:"smartnpc-castai",
    name:"SmartNpc-CastAI",
    "authors": ["zwa73"],
    "maintainers": ["zwa73"],
    "description": "SmartNpc的施法AI",
    "category": "other",
    "dependencies": ["dda",CommonModinfo.id]
}

/**处理角色技能 */
export async function buildCastAI(dm:DataManager){
    //集火
    const conattack = SNDef.genActEoc("ConcentratedAttack",[{npc_add_effect:ConcentratedAttack.id,duration:10}])
    dm.addInvokeEoc("TryAttack",0,conattack);

    const out:JObject[] = [ConcentratedAttack,conattack];

    //权重排序
    const skills = (Object.values(CastAIDataMap) as CastAIData[]);

    //全局冷却事件
    const GCDEoc = SNDef.genActEoc(`CoCooldown`,
        [{math:[uv(CoCooldownName),"-=","1"]}],
        {math:[uv(CoCooldownName),">","0"]});
    //备用计数器
    const FBEoc = SNDef.genActEoc(`Fallback`,
        [{math:[uv(FallbackValName),"+=","1"]}],
        {math:[uv(FallbackValName),"<","1000"]});
    dm.addInvokeEoc("NpcUpdate",0,GCDEoc,FBEoc);
    //初始化全局冷却
    const GCDInit = SNDef.genActEoc(`CoCooldown_Init`,
        [{math:[uv(CoCooldownName),"=","0"]}]);
    dm.addInvokeEoc("Init",0,GCDInit);
    out.push(GCDEoc,FBEoc,GCDInit);

    //遍历技能
    for(const skill of skills){
        const {id,cast_condition,cooldown,common_cooldown,common_condition} = skill;

        //获取法术数据
        const spell = getSpellByID(id);

        //法术消耗变量类型
        const costType = spell.energy_source ?? "MANA";
        const costVar = costCond(costType,getCostExpr(spell));

        //生成冷却变量名
        const cdValName = getCDName(spell);

        //前置效果
        const before_effect:EocEffect[] = [];
        if(skill.before_effect) before_effect.push(...skill.before_effect)

        //遍历释放条件
        const ccList = Array.isArray(cast_condition)
            ? cast_condition : [cast_condition];

        //设置释放条件uid
        ccList.forEach((cc,i)=>cc.id = cc.id??`${i}`);

        //遍历释放条件生成施法eoc
        for(const cast_condition of ccList){
            const {target, fallback_with} = cast_condition;

            const  {
                ignore_cost        = false,
                ignore_time        = false,
                ignore_exp         = false,
                force_lvl          = undefined,
                force_vaild_target = undefined,
            } = Object.assign({},skill,cast_condition);

            //#region 计算成功效果
            const after_effect:EocEffect[]=[];
            //共通冷却
            if(common_cooldown!=0)
                after_effect.push({math:[uv(CoCooldownName),"=",`${common_cooldown??1}`]});
            //独立冷却
            if(cooldown)
                after_effect.push({math:[uv(cdValName),"=",`${cooldown??0}`]});
            //追加效果
            if(skill.after_effect)
                after_effect.push(...skill.after_effect);
            //施法时间
            if(spell.base_casting_time && ignore_time!==true){
                after_effect.push(
                    {math:[SPELL_CT_MODMOVE_VAR,"=",getCastTimeExpr(spell)]},
                    {u_cast_spell:{id:SPELL_CT_MODMOVE,hit_self:true}}
                );
            }
            //能量消耗
            if(spell.base_energy_cost!=undefined && ignore_cost!==true)
                after_effect.push(... useCost(costType,getCostExpr(spell)));
            //经验增长
            if(ignore_exp!==true)
                after_effect.push({math:[JM.spellExp('u',`'${id}'`),"+=",`U_SpellCastExp(${JM.spellDifficulty("u",`'${id}'`)})`]});
            //清空备用计数器
            after_effect.push({math:[uv(FallbackValName),"=",String(fallback_with ?? 0)]})
            //发送施法消息
            after_effect.push({message:`<u_name> 释放了 <spell_name:${id}>`});
            //#endregion


            //#region 计算基础条件
            //计算施法等级
            const maxstr = parseSpellNumObj(spell,'max_level');
            const hasMinLvl = force_lvl!=null;
            const min_level:NumberExpr = hasMinLvl
                ? force_lvl!
                : {math:[`min(u_spell_level('${spell.id}'), ${maxstr})`]};

            const base_cond: BaseCondTable ={
                manualSwitch:[
                    {or:[
                        {math:[uv(getEnableSpellVar(spell)),"==","1"]},
                        {math:[uv(InitedCastSettingName),'!=','1']}
                    ]},
                ],
                cost: (spell.base_energy_cost!=undefined && costVar.length>0 && ignore_cost!==true)
                    ? costVar : [],
                cooldown: (cooldown != undefined && cooldown > 0)
                    ? [{math:[uv(cdValName),"<=","0"]}] : [],
                counter: (fallback_with != undefined && fallback_with > 0)
                    ? [{math:[uv(FallbackValName),">=",`${fallback_with}`]}] : [],
                know: hasMinLvl ? [] : [{math:[`u_spell_level('${spell.id}')`,">=","0"]}],
                common: common_condition ? [common_condition] : [],
            }

            //#endregion


            //处理并加入输出
            const dat:CastProcData = {
                skill, after_effect, before_effect,
                base_cond, cast_condition,min_level,
                force_vaild_target,
            }
            //生成法术
            out.push(...(await procSpellTarget(target,dm,dat)));
        }

        //独立冷却事件
        if(cooldown){
            const CDEoc=SNDef.genActEoc(`${spell.id}_cooldown`,
                [{math:[uv(cdValName),"-=","1"]}],
                {math:[uv(cdValName),">","0"]})
            dm.addInvokeEoc("NpcUpdate",0,CDEoc);
            //初始化冷却
            const CDInit = SNDef.genActEoc(`${spell.id}_cooldown_Init`,
                [{math:[uv(cdValName),"=","0"]}]);
            dm.addInvokeEoc("Init",0,CDInit);
            out.push(CDEoc,CDInit);
        }
    }

    dm.addData(out,"CastAI","Skill");
    dm.addData([CastAIModInfo],"CastAI",'modinfo');

    //创建对话
    await createCastAITalkTopic(dm);
}


