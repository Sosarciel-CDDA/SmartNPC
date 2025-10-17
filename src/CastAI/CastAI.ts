import { JObject, UtilFT } from "@zwa73/utils";
import { DATA_PATH, MAX_NUM, SNDef, getSpellByID } from "@/src/Define";
import { SpellEnergySource, EocEffect, SpellID, BoolExpr, NumberExpr, JM} from "@sosarciel-cdda/schema";
import { EOC_SEND_MESSAGE, EOC_SEND_MESSAGE_VAR, SPELL_CT_MODMOVE, SPELL_CT_MODMOVE_VAR } from "@/src/Common";
import { DataManager } from "@sosarciel-cdda/event";
import { getCastTimeExpr, getCDName, getCostExpr, getEnableSpellVar, parseSpellNumObj, uv } from "./UtilFunc";
import { BaseCondTable, CastAIData, CastAIDataJsonTable, CastAIDataTable, CastProcData } from "./Interface";
import { procSpellTarget } from "./ProcFunc";
import * as path from 'pathe';
import { ConcentratedAttack, getDefCastData } from "./DefineCastCondition";
import { createCastAITalkTopic } from "./TalkTopic";



//全局冷却字段名
export const CoCooldownName = SNDef.genVarID(`CoCooldown`);

//falback字段名
export const fallbackValName = SNDef.genVarID(`CastFallbackCounter`);

/**总开关 */
export const CoSwitchDisableName = SNDef.genVarID(`CoSwitchDisable`);

//法术消耗变量类型映射
const COST_MAP:Record<SpellEnergySource,string|undefined>={
    "BIONIC" : "u_val('power')",
    "HP"     : "u_hp('torso')",
    "MANA"   : "u_val('mana')",
    //"STAMINA": "u_val('stamina')",
    "STAMINA": "u_val('mana')",
    "NONE"   : undefined,
}
//法术消耗 使用能量表达式
const useCost = (costType:SpellEnergySource,num:string):EocEffect[]=>{
    const costVar = COST_MAP[costType];
    if(costVar===undefined) return [];

    //if(costType=="STAMINA") //模拟耐力
    //    return [{math:[costVar,'-=',`(${num})/10`]}];

    return [{math:[costVar,'-=',num]}];
}

//载入数据
/**施法AI数据 */
export const CastAIDataMap:CastAIDataTable = {};
const tableList = [
    ...UtilFT.fileSearchGlobSync(DATA_PATH,path.join("CastAI","**","*.json")),
    ...UtilFT.fileSearchGlobSync(DATA_PATH,path.join("CastAI","**","*.json5")),
];
tableList.forEach((file)=>{
    const json = UtilFT.loadJSONFileSync(file,{json5:true,forceExt:true}) as CastAIDataJsonTable;

    Object.entries(json.table).forEach(([spellID,castData])=>{
        if(castData==undefined) return;
        //转换预定义castAiData
        castData = getDefCastData(castData,spellID as SpellID);
        castData!.id = castData!.id??spellID as SpellID;
        CastAIDataMap[spellID as SpellID] = castData;

        //处理辅助条件
        castData.merge_condition = {
            manualSwitch:[{math:[uv(CoSwitchDisableName),"!=","1"]}],
            other:[
                "u_is_npc",
                {math:[uv(CoCooldownName),"<=","0"]},
                ... (json.require_mod!==undefined ? [{mod_is_loaded:json.require_mod}] : []),
                ... (json.common_condition!==undefined ? [json.common_condition] : []),
            ]
        }
        //{and:[
        //    "u_is_npc",
        //    {math:[uv(CoCooldownName),"<=","0"]},
        //    {math:[uv(CoSwitchDisableName),"!=","1"]},
        //    ... (json.require_mod!==undefined ? [{mod_is_loaded:json.require_mod}] : []),
        //    ... (json.common_condition!==undefined ? [json.common_condition] : []),
        //]};
    })
});


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
        [{math:[uv(fallbackValName),"+=","1"]}],
        {math:[uv(fallbackValName),"<","1000"]});
    dm.addInvokeEoc("NpcUpdate",0,GCDEoc,FBEoc);
    //初始化全局冷却
    const GCDInit = SNDef.genActEoc(`CoCooldown_Init`,
        [{math:[uv(CoCooldownName),"=","0"]}]);
    dm.addInvokeEoc("Init",0,GCDInit);
    out.push(GCDEoc,FBEoc,GCDInit);

    //遍历技能
    for(const skill of skills){
        const {id,cast_condition,cooldown,common_cooldown} = skill;
        //获取法术数据
        const spell = getSpellByID(id);

        //法术消耗变量类型
        const costType = spell.energy_source ?? "MANA";
        const costVar = COST_MAP[costType];

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
            const {target, ignore_cost, fallback_with} = cast_condition;
            const force_vaild_target = cast_condition.force_vaild_target ?? skill.force_vaild_target;

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
            if(spell.base_casting_time){
                after_effect.push(
                    {math:[SPELL_CT_MODMOVE_VAR,"=",getCastTimeExpr(spell)]},
                    {u_cast_spell:{id:SPELL_CT_MODMOVE,hit_self:true}}
                );
            }
            //能量消耗
            if(spell.base_energy_cost!=undefined && ignore_cost!==true)
                after_effect.push(... useCost(costType,getCostExpr(spell)));
            //经验增长
            if(cast_condition.infoge_exp!=true)
                after_effect.push({math:[JM.spellExp('u',`'${id}'`),"+=",`U_SpellCastExp(${spell.difficulty??0})`]});
            //清空备用计数器
            after_effect.push({math:[uv(fallbackValName),"=",String(fallback_with ?? 0)]})
            //发送施法消息
            after_effect.push(
                {set_string_var:`<u_name> 释放了 <spell_name:${id}>`,
                    target_var:{global_val:EOC_SEND_MESSAGE_VAR},parse_tags:true},
                {message:{global_val:EOC_SEND_MESSAGE_VAR}},
            );
            //#endregion


            //#region 计算基础条件
            //计算施法等级
            const maxstr = parseSpellNumObj(spell,'max_level');
            const hasMinLvl = cast_condition.force_lvl!=null;
            const min_level:NumberExpr = hasMinLvl
                ? cast_condition.force_lvl!
                : {math:[`min(u_spell_level('${spell.id}'), ${maxstr})`]};

            const base_cond: BaseCondTable ={
                manualSwitch:[
                    {math:[uv(getEnableSpellVar(spell)),"==","1"]},
                ],
                cost: (spell.base_energy_cost!=undefined && costVar!=undefined && ignore_cost!==true)
                    ? [{math:[costVar,">=",getCostExpr(spell)]}] : [],
                cooldown: (cooldown != undefined && cooldown > 0)
                    ? [{math:[uv(cdValName),"<=","0"]}] : [],
                counter: (fallback_with != undefined && fallback_with > 0)
                    ? [{math:[uv(fallbackValName),">=",`${fallback_with}`]}] : [],
                know: hasMinLvl ? [] : [{math:[`u_spell_level('${spell.id}')`,">=","0"]}],
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

    //创建对话
    await createCastAITalkTopic(dm);
}


