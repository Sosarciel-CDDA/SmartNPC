import { JObject} from "@zwa73/utils";
import { SADef, CON_SPELL_FLAG, getSpellByID } from "@src/SADefine";
import { Spell, Eoc, EocID, SpellFlag,} from "cdda-schema";
import { SPELL_M1T } from "@src/UtilSpell";
import { CharHook, InteractHookList, DataManager } from "cdda-event";
import { genCastEocID, genTrueEocID, revTalker } from "./CastAIGener";
import { CastProcData, TargetType } from "./CastAIInterface";


/**处理方式表 */
const ProcMap:Record<TargetType,(dm:DataManager,cpd:CastProcData)=>Promise<JObject[]>>={
    "auto"          : autoProc,
    "random"        : randomProc,
    "direct_hit"    : direct_hitProc,
    "filter_random" : filter_randomProc,
    "control_cast"  : control_castProc,
}
export async function procSpellTarget(target:TargetType|undefined,dm:DataManager,cpd:CastProcData) {
    return ProcMap[target??"auto"](dm,cpd);
}



async function randomProc(dm:DataManager,cpd:CastProcData){
    const {skill,base_cond,true_effect,cast_condition,pre_effect} = cpd;
    const {id,one_in_chance} = skill;
    const spell = getSpellByID(id);
    const lvlObj = {math:[`u_val('spell_level', 'spell: ${spell.id}')`] as [string]};
    const {hook} = cast_condition;

    //添加条件效果
    pre_effect.push(...cast_condition.before_effect??[]);
    true_effect.push(...cast_condition.after_effect??[]);

    //合并基础条件
    if(cast_condition.condition) base_cond.push(cast_condition.condition);

    //创建施法EOC
    const castEoc:Eoc={
        type:"effect_on_condition",
        id:genCastEocID(spell,cast_condition),
        eoc_type:"ACTIVATION",
        effect:[
            ...pre_effect,
            {
                u_cast_spell:{
                    id:spell.id,
                    once_in:one_in_chance,
                    min_level:lvlObj,
                },
                targeted: false,
                true_eocs:{
                    id:genTrueEocID(spell,cast_condition),
                    effect:[...true_effect],
                    eoc_type:"ACTIVATION",
                }
            }
        ],
        condition:{and:[...base_cond]},
    }

    dm.addInvokeEoc(hook as CharHook,0,castEoc);

    return [castEoc];
}

async function filter_randomProc(dm:DataManager,cpd:CastProcData){
    let {skill,base_cond,true_effect,cast_condition,pre_effect} = cpd;
    const {id,one_in_chance} = skill;
    const spell = getSpellByID(id);
    const lvlObj = {math:[`u_val('spell_level', 'spell: ${spell.id}')`] as [string]};
    const {hook} = cast_condition;

    //添加条件效果
    pre_effect.push(...cast_condition.before_effect??[]);
    true_effect.push(...cast_condition.after_effect??[]);

    //设置翻转条件
    const filterCond = cast_condition.condition ? revTalker(cast_condition.condition) : undefined;

    //命中id
    const fhitvar = `${spell.id}_hasTarget`;

    //创建施法EOC
    const castEoc:Eoc={
        type:"effect_on_condition",
        id:genCastEocID(spell,cast_condition),
        eoc_type:"ACTIVATION",
        effect:[
            ...pre_effect,
            {
                u_cast_spell:{
                    id:spell.id,
                    once_in:one_in_chance,
                    min_level:lvlObj,
                },
                true_eocs:{
                    id:genTrueEocID(spell,cast_condition),
                    effect:[...true_effect],
                    eoc_type:"ACTIVATION",
                },
                loc:{global_val:"tmp_loc"}
            }
        ],
        condition:{math:[fhitvar,"!=","0"]},
    }

    //创建记录坐标Eoc
    const locEoc:Eoc={
        id:SADef.genEOCID(`${spell.id}_RecordLoc`),
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[
            {math:[fhitvar,"=","1"]},
            {npc_location_variable: { global_val: "tmp_loc" }},
        ],
        condition:{and:[
            ... filterCond ? [filterCond] : [],
            {math:[fhitvar,"!=","1"]},
        ]}
    }

    //创建筛选目标的辅助索敌法术
    const flags:SpellFlag[] = [...CON_SPELL_FLAG];
    if(spell.flags?.includes("IGNORE_WALLS"))
        flags.push("IGNORE_WALLS")
    const {min_range,max_range,range_increment,
        max_level,valid_targets,targeted_monster_ids} = spell;
    const filterTargetSpell:Spell = {
        id:SADef.genSpellID(`${spell.id}_FilterTarget_${cast_condition.id}`),
        type:"SPELL",
        name:spell.name+"_筛选索敌",
        description:`${spell.name}的筛选索敌法术`,
        effect:"effect_on_condition",
        effect_str:locEoc.id,
        flags,
        shape:"blast",
        min_aoe:min_range,
        max_aoe:max_range,
        aoe_increment:range_increment,
        max_level,targeted_monster_ids,
        valid_targets:valid_targets.filter(item=>item!="ground"),
    }

    //创建释放索敌法术的eoc
    const castSelEoc:Eoc = {
        type:"effect_on_condition",
        id:SADef.genEOCID(`Cast${filterTargetSpell.id}`),
        eoc_type:"ACTIVATION",
        effect:[
            {u_cast_spell:{id:filterTargetSpell.id,once_in:one_in_chance}},
            {run_eocs:castEoc.id},
            {math:[fhitvar,"=","0"]}
        ],
        condition:{and:[...base_cond]},
    }

    dm.addInvokeEoc(hook as CharHook,0,castSelEoc);

    return [locEoc,castEoc,castSelEoc,filterTargetSpell];
}

async function direct_hitProc(dm:DataManager,cpd:CastProcData){
    const {skill,base_cond,true_effect,cast_condition,pre_effect} = cpd;
    const {id,one_in_chance} = skill;
    const spell = getSpellByID(id);
    const lvlObj = {math:[`u_val('spell_level', 'spell: ${spell.id}')`] as [string]};
    const {hook} = cast_condition;

    //添加条件效果
    pre_effect.push(...cast_condition.before_effect??[]);
    true_effect.push(...cast_condition.after_effect??[]);

    //合并基础条件
    if(cast_condition.condition) base_cond.push(cast_condition.condition);

    //创建施法EOC
    const castEoc:Eoc={
        type:"effect_on_condition",
        id:genCastEocID(spell,cast_condition),
        eoc_type:"ACTIVATION",
        effect:[
            ...pre_effect,
            {npc_location_variable: { global_val: "tmp_loc" }},
            {
                u_cast_spell:{
                    id:spell.id,
                    once_in:one_in_chance,
                    min_level:lvlObj,
                },
                true_eocs:{
                    id:genTrueEocID(spell,cast_condition),
                    effect:[...true_effect],
                    eoc_type:"ACTIVATION",
                },
                loc:{ global_val: "tmp_loc" }
            }
        ],
        condition:{and:[...base_cond]},
    }

    //加入触发
    if(!InteractHookList.includes(hook as any))
        throw `直接命中 所用的事件必须为 交互事件: ${InteractHookList}`
    dm.addInvokeEoc(hook as CharHook,0,castEoc);

    return [castEoc];
}

async function autoProc(dm:DataManager,cpd:CastProcData){
    const {skill,cast_condition} = cpd;
    const {id} = skill;
    const spell = getSpellByID(id);
    const {hook} = cast_condition;
    //判断瞄准方式
    //是敌对目标法术
    const isHostileTarget = spell.valid_targets.includes("hostile");
    const isAllyTarget    = spell.valid_targets.includes("ally");

    //有释放范围
    const hasRange = (spell.min_range!=null && spell.min_range!=0) ||
        (spell.range_increment!=null && spell.range_increment!=0);

    //有范围 有条件 友方目标 法术适用筛选命中
    if(isAllyTarget && hasRange && cast_condition.condition!=undefined)
        return ProcMap.filter_random(dm,cpd);

    //hook为互动事件 敌对目标 法术将直接命中
    if((InteractHookList.includes(hook as any)) && isHostileTarget)
        return ProcMap.direct_hit(dm,cpd);

    //其他法术随机
    return ProcMap.random(dm,cpd);
}

async function control_castProc(dm:DataManager,cpd:CastProcData){
    const {skill,cast_condition} = cpd;
    let {base_cond,true_effect,pre_effect} = cpd;
    const {id} = skill;
    const spell = getSpellByID(id);
    const lvlObj = {math:[`n_val('spell_level', 'spell: ${spell.id}')`] as [string]};
    //删除开关条件
    base_cond.shift();

    //添加条件效果
    pre_effect.push(...cast_condition.before_effect??[]);
    true_effect.push(...cast_condition.after_effect??[]);

    //合并基础条件
    if(cast_condition.condition) base_cond.push(cast_condition.condition);

    //翻转对话者 将u改为n使其适用npc
    base_cond   = revTalker(base_cond);
    true_effect = revTalker(true_effect);
    pre_effect  = revTalker(pre_effect);

    //玩家的选择位置
    const playerSelectLoc = { global_val:`${spell.id}_loc`};

    const coneocid = genCastEocID(spell,cast_condition);
    //创建选择施法eoc
    const controlEoc:Eoc={
        type:"effect_on_condition",
        id:coneocid,
        eoc_type:"ACTIVATION",
        effect:[
            {u_cast_spell:{id:SPELL_M1T, hit_self:true, min_level:lvlObj}},
            {npc_location_variable:{global_val:"tmp_casterloc"}},
            {queue_eocs:{
                id:(coneocid+"_queue") as EocID,
                eoc_type:"ACTIVATION",
                effect:[{run_eoc_with:{
                    id: (coneocid+"_queue_with") as EocID,
                    eoc_type:"ACTIVATION",
                    effect:[{
                        if:{u_query_tile:"line_of_sight",target_var:playerSelectLoc,range:30},
                        then:[
                            ...pre_effect,{
                            npc_cast_spell:{id:spell.id},
                            targeted: false,
                            true_eocs:{
                                id:genTrueEocID(spell,cast_condition),
                                effect:[...true_effect],
                                eoc_type:"ACTIVATION",
                            },
                            loc:playerSelectLoc
                        }]
                    }]
                },beta_loc:{global_val:"tmp_casterloc"}}]
            },time_in_future:0},
        ],
        false_effect:[],
        condition:{and:[...base_cond]}
    }

    //生成面板数据
    const sourceNameMap = {
        "MANA"      : "魔力"    ,
        "BIONIC"    : "生化能量",
        "HP"        : "生命值"  ,
        "STAMINA"   : "耐力"    ,
    }
    const source:string = (sourceNameMap as any)[spell.energy_source as any]??"";
    const coststr = spell.base_energy_cost==0 || spell.base_energy_cost==undefined
        ? ""
        : `耗能:${spell.base_energy_cost}${source}`;
    return [controlEoc];
}