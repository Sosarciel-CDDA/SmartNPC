import { JObject, UtilFT, UtilFunc } from "@zwa73/utils";
import { DATA_PATH, MAX_NUM, SADef, getSpellByID } from "@src/SADefine";
import { Spell, SpellEnergySource, BoolObj, EocEffect, SpellID, NumObj} from "cdda-schema";
import { SPELL_CT_MODMOVE, SPELL_CT_MODMOVE_VAR } from "@src/UtilSpell";
import { DataManager } from "cdda-event";
import { getDisableSpellVar, parseSpellNumObj } from "./CastAIGener";
import { CastAIData, CastAIDataTable, CastProcData } from "./CastAIInterface";
import { procSpellTarget } from "./ProcFunc";
import * as path from 'path';
import { getDefCastData } from "./DefData";
import { createCastAITalkTopic } from "./TalkTopic";



//全局冷却字段名
const gcdValName = `u_coCooldown`;

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
const tableList = UtilFT.fileSearchGlob(path.join(DATA_PATH,"CastAI","**","*.json").replaceAll("\\","/"));
tableList.forEach((file)=>{
    const json = UtilFT.loadJSONFileSync(file) as CastAIDataTable;
    Object.entries(json).forEach(([k,v])=>{
        if(v==undefined) throw "";
        v = getDefCastData(v,k as SpellID);
        v!.id = v!.id??k as SpellID;
        CastAIDataMap[k as SpellID] = v;
    })
});

/**处理角色技能 */
export async function createCastAI(dm:DataManager){
    const out:JObject[] = [];

    //权重排序
    const skills = (Object.values(CastAIDataMap) as CastAIData[]);

    //全局冷却事件
    const GCDEoc = SADef.genActEoc(`CoCooldown`,
        [{math:[gcdValName,"-=","1"]}],
        {math:[gcdValName,">","0"]});
    dm.addInvokeEoc("Update",0,GCDEoc);
    out.push(GCDEoc);

    //遍历技能
    for(const skill of skills){
        const {id,cast_condition,cooldown,common_cooldown,after_effect,before_effect} = skill;
        //获取法术数据
        const spell = getSpellByID(id);

        //法术消耗字符串
        const spellCost=`min(${parseSpellNumObj(spell,"base_energy_cost")} + ${parseSpellNumObj(spell,"energy_increment")} * `+
                        `u_spell_level('${spell.id}'), ${parseSpellNumObj(spell,"final_energy_cost",MAX_NUM)})`;

        //法术消耗变量类型
        const costVar = spell.energy_source !== undefined
            ? COST_MAP[spell.energy_source]
            : undefined;

        //生成冷却变量名
        const cdValName = `u_${spell.id}_cooldown`;

        //前置效果
        const pre_effect:EocEffect[] = [];
        if(before_effect) pre_effect.push(...before_effect)

        //遍历释放条件
        const ccs = Array.isArray(cast_condition)
            ?cast_condition
            :[cast_condition] as const;
        ccs.forEach((cc,i)=>cc.id = cc.id??i+"");

        //遍历释放条件生成施法eoc
        for(const cast_condition of ccs){
            const {target, ignore_cost} = cast_condition;

            //计算成功效果
            const true_effect:EocEffect[]=[];
            //共通冷却
            if(common_cooldown!=0)
                true_effect.push({math:[gcdValName,"=",`${common_cooldown??1}`]});
            //独立冷却
            if(cooldown)
                true_effect.push({math:[cdValName,"=",`${cooldown??0}`]});
            //追加效果
            if(after_effect)
                true_effect.push(...after_effect);
            //施法时间
            if(spell.base_casting_time){
                const ct =  `min(${parseSpellNumObj(spell,"base_casting_time")} + ${parseSpellNumObj(spell,"casting_time_increment")} * `+
                            `u_spell_level('${spell.id}'), ${parseSpellNumObj(spell,"final_casting_time",MAX_NUM)})`;
                true_effect.push(
                    {math:[SPELL_CT_MODMOVE_VAR,"=",ct]},
                    {u_cast_spell:{id:SPELL_CT_MODMOVE,hit_self:true}}
                );
            }
            //能量消耗
            if(spell.base_energy_cost!=undefined && costVar!=undefined && ignore_cost!==true)
                true_effect.push({math:[costVar,"-=",spellCost]});
            //经验增长
            if(cast_condition.infoge_exp!=true)
                true_effect.push({math:[`u_skill_exp('${spell.difficulty??0}')`,"+=",`N_SpellCastExp('${spell.difficulty??0}')`]});


            //计算基础条件 确保第一个为技能开关, 用于cast_control读取
            const base_cond: BoolObj[] = [
                {math:[getDisableSpellVar("u",spell),"!=","1"]},
                "u_is_npc",
                {math:[`u_spell_level('${spell.id}')`,">=","0"]},
                {math:[gcdValName,"<=","0"]},
            ];
            //能量消耗
            if(spell.base_energy_cost!=undefined && costVar!=undefined && ignore_cost!==true)
                base_cond.push({math:[costVar,">=",spellCost]});
            //物品消耗
            //if(spell.)
            //冷却
            if(cooldown)
                base_cond.push({math:[cdValName,"<=","0"]});


            //计算施法等级
            let min_level:NumObj = {math:[`u_spell_level('${spell.id}')`] as [string]};
            if(cast_condition.force_lvl!=null) min_level = cast_condition.force_lvl;


            //处理并加入输出
            const dat:CastProcData = {
                skill, true_effect, pre_effect,
                base_cond, cast_condition,min_level
            }
            //生成法术
            out.push(...(await procSpellTarget(target,dm,dat)));
        }

        //独立冷却事件
        if(cooldown){
            const CDEoc=SADef.genActEoc(`${spell.id}_cooldown`,
                [{math:[cdValName,"-=","1"]}],
                {math:[cdValName,">","0"]})
            dm.addInvokeEoc("Update",0,CDEoc);
            out.push(CDEoc);
        }
    }

    dm.addStaticData(out,"CastAI","skill");

    //创建对话
    await createCastAITalkTopic(dm);
}


