import { JObject, UtilFT } from "@zwa73/utils";
import { DATA_PATH, MAX_NUM, SADef, getSpellByID } from "@src/SADefine";
import { SpellEnergySource, EocEffect, SpellID, BoolExpr, NumberExpr} from "@sosarciel-cdda/schema";
import { SPELL_CT_MODMOVE, SPELL_CT_MODMOVE_VAR } from "@src/UtilSpell";
import { DataManager } from "@sosarciel-cdda/event";
import { getDisableSpellVar, parseSpellNumObj } from "./CastAIGener";
import { CastAIData, CastAIDataJsonTable, CastAIDataTable, CastProcData } from "./CastAIInterface";
import { procSpellTarget } from "./ProcFunc";
import * as path from 'pathe';
import { ConcentratedAttack, getDefCastData } from "./DefData";
import { createCastAITalkTopic } from "./TalkTopic";



//全局冷却字段名
const gcdValName = `u_coCooldown`;

//falback字段名
const fallbackValName = "u_castFallbackCounter";

//法术消耗变量类型映射
const COST_MAP:Record<SpellEnergySource,string|undefined>={
    "BIONIC" : "u_val('power')",
    "HP"     : "u_hp('torso')",
    "MANA"   : "u_val('mana')",
    "STAMINA": "u_val('stamina')",
    "NONE"   : undefined,
}


//载入数据
/**施法AI数据 */
export const CastAIDataMap:CastAIDataTable = {};
const tableList = UtilFT.fileSearchGlobSync(DATA_PATH,path.join("CastAI","**","*.json").replaceAll("\\","/"));
tableList.forEach((file)=>{
    const json = UtilFT.loadJSONFileSync(file) as CastAIDataJsonTable;

    Object.entries(json.table).forEach(([spellID,castData])=>{
        if(castData==undefined) throw "";
        //转换预定义castAiData
        castData = getDefCastData(castData,spellID as SpellID);
        castData!.id = castData!.id??spellID as SpellID;
        CastAIDataMap[spellID as SpellID] = castData;

        //处理辅助条件
        castData.merge_condition = {and:[
            "u_is_npc",
            ... (json.require_mod!==undefined ? [{mod_is_loaded:json.require_mod}] : []),
            ... (json.common_condition!==undefined ? [json.common_condition] : []),
        ]};
    })
});


/**处理角色技能 */
export async function createCastAI(dm:DataManager){
    //集火
    const conattack = SADef.genActEoc("ConcentratedAttack",[
        {npc_add_effect:ConcentratedAttack.id,duration:10}
    ])
    dm.addInvokeEoc("TryAttack",0,conattack);

    const out:JObject[] = [ConcentratedAttack,conattack];



    //权重排序
    const skills = (Object.values(CastAIDataMap) as CastAIData[]);

    //全局冷却事件
    const GCDEoc = SADef.genActEoc(`CoCooldown`,
        [{math:[gcdValName,"-=","1"]}],
        {math:[gcdValName,">","0"]});
    //备用计数器
    const FBEoc = SADef.genActEoc(`Fallback`,
        [{math:[fallbackValName,"+=","1"]}],
        {math:[fallbackValName,"<","1000"]});
    dm.addInvokeEoc("NpcUpdate",0,GCDEoc,FBEoc);
    //初始化全局冷却
    const GCDInit = SADef.genActEoc(`CoCooldown_Init`,
        [{math:[gcdValName,"=","0"]}]);
    dm.addInvokeEoc("Init",0,GCDInit);
    out.push(GCDEoc,FBEoc,GCDInit);

    //遍历技能
    for(const skill of skills){
        const {id,cast_condition,cooldown,common_cooldown,common_condition} = skill;
        //获取法术数据
        const spell = getSpellByID(id);

        //法术消耗字符串
        const spellCost=`min(${parseSpellNumObj(spell,"base_energy_cost")} + ${parseSpellNumObj(spell,"energy_increment")} * `+
                        `u_spell_level('${spell.id}'), ${parseSpellNumObj(spell,"final_energy_cost",MAX_NUM)})`;

        //法术消耗变量类型
        const costVar = spell.energy_source !== undefined
            ? COST_MAP[spell.energy_source]
            : COST_MAP["MANA"];

        //生成冷却变量名
        const cdValName = `u_${spell.id}_cooldown`;

        //前置效果
        const before_effect:EocEffect[] = [];
        if(skill.before_effect) before_effect.push(...skill.before_effect)

        //遍历释放条件
        const ccs = Array.isArray(cast_condition)
            ?cast_condition
            :[cast_condition] as const;
        ccs.forEach((cc,i)=>cc.id = cc.id??`${i}`);

        //遍历释放条件生成施法eoc
        for(const cast_condition of ccs){
            const {target, ignore_cost, fallback_with} = cast_condition;
            const force_vaild_target = cast_condition.force_vaild_target ?? skill.force_vaild_target;

            //#region 计算成功效果
            const after_effect:EocEffect[]=[];
            //共通冷却
            if(common_cooldown!=0)
                after_effect.push({math:[gcdValName,"=",`${common_cooldown??1}`]});
            //独立冷却
            if(cooldown)
                after_effect.push({math:[cdValName,"=",`${cooldown??0}`]});
            //追加效果
            if(skill.after_effect)
                after_effect.push(...skill.after_effect);
            //施法时间
            if(spell.base_casting_time){
                const ct =  `min(${parseSpellNumObj(spell,"base_casting_time")} + ${parseSpellNumObj(spell,"casting_time_increment")} * `+
                            `u_spell_level('${spell.id}'), ${parseSpellNumObj(spell,"final_casting_time",MAX_NUM)})`;
                after_effect.push(
                    {math:[SPELL_CT_MODMOVE_VAR,"=",ct]},
                    {u_cast_spell:{id:SPELL_CT_MODMOVE,hit_self:true}}
                );
            }
            //能量消耗
            if(spell.base_energy_cost!=undefined && costVar!=undefined && ignore_cost!==true)
                after_effect.push({math:[costVar,"-=",spellCost]});
            //经验增长
            if(cast_condition.infoge_exp!=true)
                after_effect.push({math:[`u_skill_exp('${spell.difficulty??0}')`,"+=",`U_SpellCastExp(${spell.difficulty??0})`]});
            //清空备用计数器
            after_effect.push({math:[fallbackValName,"=",String(fallback_with ?? 0)]})
            //#endregion


            //#region 计算基础条件
            //确保第一个为技能开关, 用于cast_control读取 
            const base_cond: BoolExpr[] = [
                {math:[getDisableSpellVar("u",spell),"!=","1"]},
                {math:[gcdValName,"<=","0"]},
            ];
            //共同条件
            if(common_condition) base_cond.push(common_condition);
            //能量消耗
            if(spell.base_energy_cost!=undefined && costVar!=undefined && ignore_cost!==true)
                base_cond.push({math:[costVar,">=",spellCost]});
            //物品消耗
            //if(spell.)
            //冷却
            if(cooldown)
                base_cond.push({math:[cdValName,"<=","0"]});
            //备用计数器
            if(fallback_with !== undefined)
                base_cond.push({math:[fallbackValName,">=",`${fallback_with}`]})

            //计算施法等级
            const maxstr = parseSpellNumObj(spell,'max_level');
            let min_level:NumberExpr = {math:[`min(u_spell_level('${spell.id}'), ${maxstr})`] as [string]};
            if(cast_condition.force_lvl!=null)
                min_level = cast_condition.force_lvl;
            else base_cond.push({math:[`u_spell_level('${spell.id}')`,">=","0"]});
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
            const CDEoc=SADef.genActEoc(`${spell.id}_cooldown`,
                [{math:[cdValName,"-=","1"]}],
                {math:[cdValName,">","0"]})
            dm.addInvokeEoc("NpcUpdate",0,CDEoc);
            //初始化冷却
            const CDInit = SADef.genActEoc(`${spell.id}_cooldown_Init`,
                [{math:[cdValName,"=","0"]}]);
            dm.addInvokeEoc("Init",0,CDInit);
            out.push(CDEoc,CDInit);
        }
    }

    dm.addData(out,"CastAI","skill");

    //创建对话
    await createCastAITalkTopic(dm);
}


