import { JObject} from "@zwa73/utils";
import { SADef, CON_SPELL_FLAG, getSpellByID, MAX_NUM } from "@/src/SADefine";
import { Spell, Eoc, SpellFlag, Resp, EocEffect, BoolExpr} from "@sosarciel-cdda/schema";
import { InteractHookList, DataManager } from "@sosarciel-cdda/event";
import { genCastEocID, genTrueEocID, getCostExpr, getEventWeight, parseSpellNumObj } from "./CastAIGener";
import { CastProcData, TargetType } from "./CastAIInterface";
import { SPELL_L1T } from "@/src/UtilSpell";

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

const concat = <T>(...args:(T|undefined)[][]):Exclude<T,undefined>[]=>{
    const out:(T|undefined)[] = [];
    for(const arg of args){
        if(arg!=undefined)
            out.push(...arg);
    }
    return out.filter(item=>item!=undefined) as any;
}

/**控制施法所需的前置效果 */
export const ControlCastSpeakerEffects:EocEffect[] = [];
/**控制施法的回复 */
export const ControlCastResps:Resp[]=[];

async function randomProc(dm:DataManager,cpd:CastProcData){
    const {skill,base_cond,after_effect,cast_condition,before_effect,min_level,force_vaild_target} = cpd;
    const {id,merge_condition,one_in_chance} = skill;
    const spell = getSpellByID(id);
    const {hook} = cast_condition;

    const {max_level,range_increment,min_range,max_range,valid_targets,targeted_monster_ids,targeted_monster_species} = spell;

    const fixedBeforeEffect = concat(before_effect,cast_condition.before_effect??[]);
    const fixedAfterEffect = concat(after_effect,cast_condition.after_effect??[]);
    const fixedCond = concat(base_cond,[cast_condition.condition]);

    //命中id
    const fhitvar = `${spell.id}_hasTarget`;
    //创建施法EOC 应与filter一样使用标记法术 待修改
    const castEoc:Eoc={
        type:"effect_on_condition",
        id:genCastEocID(spell,cast_condition),
        eoc_type:"ACTIVATION",
        effect:[
            ...fixedBeforeEffect,
            {
                u_cast_spell:{ id:spell.id, min_level },
                targeted: false,
                true_eocs:{
                    id:genTrueEocID(spell,cast_condition),
                    effect:[...fixedAfterEffect],
                    eoc_type:"ACTIVATION",
                },
                loc:{global_val:"tmp_loc"}
            }
        ],
        condition:{math:[fhitvar,"!=","0"]},
    }

    //辅助法术记录坐标的Eoc
    const extraHelperEoc:Eoc={
        id:SADef.genEOCID(`${spell.id}_RandomRecordLoc_${cast_condition.id}`),
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[
            {math:[fhitvar,"=","1"]},
            {u_location_variable: { global_val: "tmp_loc" }},
        ],
        condition:{math:[fhitvar,"!=","1"]},
    }
    //创建辅助法术
    const helperflags:SpellFlag[] = [...CON_SPELL_FLAG];
    if(spell.flags?.includes("IGNORE_WALLS")) helperflags.push("IGNORE_WALLS");
    //随机目标flag只在extra内起效, 所以需要此子法术来索敌
    const extraHelperSpell:Spell={
        type: "SPELL",
        id: SADef.genSpellID(`${spell.id}_RandomTargetSub_${cast_condition.id}`),
        name:`${spell.name}_子随机索敌`,
        description:`${spell.name}的子随机索敌法术`,
        effect: "effect_on_condition",
        effect_str:extraHelperEoc.id,
        shape: "blast",
        flags: [...helperflags,'RANDOM_TARGET'],
        max_level,range_increment,min_range,max_range,
        targeted_monster_ids,targeted_monster_species,
        valid_targets:force_vaild_target ?? valid_targets.filter(item=>item!="ground"),
    }
    //用于进行随机索敌的法术
    const helperSpell:Spell={
        type: "SPELL",
        id: SADef.genSpellID(`${spell.id}_RandomTarget_${cast_condition.id}`),
        name:`${spell.name}_主随机索敌`,
        description:`${spell.name}的主随机索敌法术`,
        valid_targets: ["self"],
        effect: "attack",
        shape: "blast",
        flags: [...helperflags],
        extra_effects:[{id:extraHelperSpell.id}],
        max_level,
    }

    //主逻辑eoc
    const mainEoc:Eoc = {
        type:"effect_on_condition",
        id:SADef.genEOCID(`Cast${helperSpell.id}`),
        eoc_type:"ACTIVATION",
        effect:[
            {u_cast_spell:{id:helperSpell.id,min_level}},
            {run_eocs:castEoc.id},
            {math:[fhitvar,"=","0"]}
        ],
        condition:{and:[{ one_in_chance:one_in_chance??1 },...fixedCond]},
    }

    //建立便于event合并的if语法
    const eff:EocEffect={
        if:merge_condition!,
        then:[{run_eocs:[mainEoc.id]}]
    }
    dm.addEvent(hook,getEventWeight(skill,cast_condition),[eff]);

    // eff -> mainEoc -> (helperSpell -> extraHelperSpell -> extraHelperEoc) -> castEoc
    return [castEoc,helperSpell,extraHelperSpell,extraHelperEoc,mainEoc];
}

async function filter_randomProc(dm:DataManager,cpd:CastProcData){
    const {skill,base_cond,after_effect,cast_condition,before_effect,min_level,force_vaild_target} = cpd;
    const {id,merge_condition,one_in_chance} = skill;
    const spell = getSpellByID(id);
    const {hook} = cast_condition;

    //添加条件效果
    const fixedBeforeEffect = concat(before_effect,cast_condition.before_effect??[]);
    const fixedAfterEffect = concat(after_effect,cast_condition.after_effect??[]);

    //命中id
    const fhitvar = `${spell.id}_hasTarget`;

    //创建施法EOC
    const castEoc:Eoc={
        type:"effect_on_condition",
        id:genCastEocID(spell,cast_condition),
        eoc_type:"ACTIVATION",
        effect:[
            ...fixedBeforeEffect,
            {
                u_cast_spell:{ id:spell.id, min_level },
                true_eocs:{
                    id:genTrueEocID(spell,cast_condition),
                    effect:[...fixedAfterEffect],
                    eoc_type:"ACTIVATION",
                },
                loc:{global_val:"tmp_loc"}
            }
        ],
        condition:{math:[fhitvar,"!=","0"]},
    }

    //筛选目标的Eoc
    const filterTargetEoc:Eoc={
        id:SADef.genEOCID(`${spell.id}_RecordLoc_${cast_condition.id}`),
        type:"effect_on_condition",
        eoc_type:"ACTIVATION",
        effect:[{run_eocs:{
            id:SADef.genEOCID(`${spell.id}_RecordLocRev_${cast_condition.id}`),
            eoc_type:"ACTIVATION",
            effect:[{if:{and:[
                ... (cast_condition.condition ? [cast_condition.condition] : []),
                {math:[fhitvar,"!=","1"]},
            ]},
            then:[
                {math:[fhitvar,"=" ,"1"]},
                {npc_location_variable: { global_val: "tmp_loc" }}
            ]}],
        },alpha_talker:"npc",beta_talker:"u"}],
        condition:{math:[fhitvar,"!=","1"]}
    }

    //筛选目标的辅助索敌法术
    const flags:SpellFlag[] = [...CON_SPELL_FLAG];
    if(spell.flags?.includes("IGNORE_WALLS")) flags.push("IGNORE_WALLS")
    const {min_range,max_range,range_increment,
        max_level,valid_targets,targeted_monster_ids} = spell;
    //console.log(spell.id);
    const filterTargetSpell:Spell = {
        id:SADef.genSpellID(`${spell.id}_FilterTarget_${cast_condition.id}`),
        type:"SPELL",
        name:`${spell.id}_筛选索敌`,
        description:`${spell.id}的筛选索敌法术`,
        effect:"effect_on_condition",
        effect_str:filterTargetEoc.id,
        flags,
        shape:"blast",
        min_aoe:min_range,
        max_aoe:max_range,
        aoe_increment:range_increment,
        max_level,targeted_monster_ids,
        valid_targets:force_vaild_target ?? valid_targets.filter(item=>item!="ground"),
    }

    //主逻辑eoc
    const mainEoc:Eoc = {
        type:"effect_on_condition",
        id:SADef.genEOCID(`Cast${filterTargetSpell.id}`),
        eoc_type:"ACTIVATION",
        effect:[
            //{set_string_var:`try ${spell.id}`,target_var:{global_val:'tmpstr'}},
            {u_cast_spell:{id:filterTargetSpell.id,min_level}},
            {run_eocs:castEoc.id},
            {math:[fhitvar,"=","0"]}
        ],
        condition:{and:[{ one_in_chance:one_in_chance??1 },...base_cond]},
    }

    //建立便于event合并的if语法
    const eff:EocEffect={
        if:merge_condition!,
        then:[{run_eocs:[mainEoc.id]}]
    }

    // eff -> mainEoc -> (filterTargetSpell -> filterTargetEoc) -> castEoc
    dm.addEvent(hook,getEventWeight(skill,cast_condition),[eff]);

    return [filterTargetEoc,castEoc,mainEoc,filterTargetSpell];
}

async function direct_hitProc(dm:DataManager,cpd:CastProcData){
    const {skill,base_cond,after_effect,cast_condition,before_effect,min_level} = cpd;
    const {id,merge_condition,one_in_chance} = skill;
    const spell = getSpellByID(id);
    const {hook} = cast_condition;

    //射程条件
    const rangeMathExpr=`min(${parseSpellNumObj(spell,"min_range")} + ${parseSpellNumObj(spell,"range_increment")} * `+
        `u_spell_level('${spell.id}'), ${parseSpellNumObj(spell,"max_range",MAX_NUM)})`;

    const fixedBeforeEffect = concat(before_effect,cast_condition.before_effect??[]);
    const fixedAfterEffect = concat(after_effect,cast_condition.after_effect??[]);
    const fixedCond = concat(base_cond,[cast_condition.condition],[{math:["distance('u', 'npc')" as const,"<=" as const,rangeMathExpr]}]);

    //创建施法EOC
    const castEoc:Eoc={
        type:"effect_on_condition",
        id:genCastEocID(spell,cast_condition),
        eoc_type:"ACTIVATION",
        effect:[
            ...fixedBeforeEffect,
            {npc_location_variable: { context_val: "_target_loc" }},
            {
                u_cast_spell:{ id:spell.id, min_level},
                true_eocs:{
                    id:genTrueEocID(spell,cast_condition),
                    effect:[...fixedAfterEffect],
                    eoc_type:"ACTIVATION",
                },
                loc:{ context_val: "_target_loc" }
            }
        ],
        condition:{and:[{ one_in_chance:one_in_chance??1 },...fixedCond]},
    }

    //加入触发
    if(!InteractHookList.includes(hook as any))
        throw `直接命中 所用的事件必须为 交互事件: ${InteractHookList}`

    //建立便于event合并的if语法
    const eff:EocEffect={
        if:merge_condition!,
        then:[{run_eocs:[castEoc.id]}]
    }
    dm.addEvent(hook,getEventWeight(skill,cast_condition),[eff]);

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
    const {base_cond,after_effect,before_effect,min_level} = cpd;
    const {id,merge_condition} = skill;
    const spell = getSpellByID(id);

    //删除开关条件
    //计算基础条件时 确保第一个为技能开关, 用于此刻读取
    const [switchCond,...restCond] = base_cond;

    const fixedBeforeEffect = concat(before_effect,cast_condition.before_effect??[]);
    const fixedAfterEffect = concat(after_effect,cast_condition.after_effect??[]);
    const fixedCond = concat(restCond,[cast_condition.condition],[merge_condition]); // 不经过触发, 需要加上merge_condition

    //玩家的选择位置
    const playerSelectLoc = { global_val:`${spell.id}_control_cast_loc`};
    // 判断是否选中位置
    const coneocid = genCastEocID(spell,cast_condition);
    //创建选择施法eoc
    const controlEoc:Eoc={
        type:"effect_on_condition",
        id:coneocid,
        eoc_type:"ACTIVATION",
        effect:[
            {npc_location_variable:{global_val:"tmp_control_cast_casterloc"}},
            {u_location_variable:{global_val:"tmp_control_cast_avatarloc"}},

            //设置一个标准位置用于判断坐标是否变动
            {u_location_variable:{global_val:"tmp_control_cast_testloc"}},
            {location_variable_adjust:{global_val:"tmp_control_cast_testloc"},z_adjust:-10},
            {u_location_variable:playerSelectLoc},
            {location_variable_adjust:playerSelectLoc,z_adjust:-10},

            {run_eocs:{
                id:`${coneocid}_rev`,
                eoc_type:"ACTIVATION",
                effect:[
                    {if:{and:[...fixedCond]}, then:[
                        {run_eocs:{
                            id:`${coneocid}_queue`,
                            eoc_type:"ACTIVATION",
                            effect:[{run_eocs:{
                                id: `${coneocid}_queue_with`,
                                eoc_type:"ACTIVATION",
                                effect:[
                                    {npc_query_tile:"line_of_sight",target_var:playerSelectLoc,range:30},
                                    {if:{math: [ `distance(${playerSelectLoc.global_val}, tmp_control_cast_testloc)`, ">", "0" ] },then:[
                                        ...fixedBeforeEffect,
                                        {u_cast_spell:{ id:spell.id, min_level },
                                        targeted: false,
                                        true_eocs:{
                                            id:genTrueEocID(spell,cast_condition),
                                            effect:[...fixedAfterEffect],
                                            eoc_type:"ACTIVATION",
                                        },
                                        loc:playerSelectLoc}
                                    ]
                                }]
                            },
                            alpha_loc:{global_val:"tmp_control_cast_casterloc"},
                            beta_loc:{global_val:"tmp_control_cast_avatarloc"}}]
                        },time_in_future:0},
                        {npc_cast_spell:{id:SPELL_L1T, hit_self:true}},
                        {u_cast_spell:{id:SPELL_L1T, hit_self:true}},
                    ]}
                ]
            },alpha_talker:"npc",beta_talker:"u"}
        ],
    }

    //预先计算能耗与翻转条件
    const costVar = `tmp_${spell.id}_cost`;
    const vaildVar = `tmp_${spell.id}_vaild`;
    ControlCastSpeakerEffects.push(
        {math:[`u_${costVar}`,"=",getCostExpr(spell)]},
        {
            if:{and:[...fixedCond]},
            then:[{math:[`u_${vaildVar}`,'=','1']}],
            else:[{math:[`u_${vaildVar}`,'=','0']}],
        }
    );

    //生成展示字符串
    const sourceNameMap:Record<string,string> = {
        "MANA"      : "魔力"    ,
        "BIONIC"    : "生化能量",
        "HP"        : "生命值"  ,
        "STAMINA"   : "耐力"    ,
    };
    const source = sourceNameMap[spell.energy_source ?? "MANA"];
    const costDisplay = (source != null && cast_condition.ignore_cost !== true)
            ? `耗能: <npc_val:${costVar}> ${source} `
            : "";

    //创建施法对话
    const castResp:Resp={
        condition:cast_condition.force_lvl!=null ? undefined : {math:[`n_spell_level('${spell.id}')`,">=","0"]},
        truefalsetext:{
            condition:{math:[`n_${vaildVar}`,"==","1"]},
            true:`[可释放] <spell_name:${id}> ${costDisplay}`,
            false:`[不可释放] <spell_name:${id}> ${costDisplay}冷却:<npc_val:${spell.id}_cooldown>`,
        },
        effect:{run_eocs:controlEoc.id},
        topic:"TALK_DONE",
    }
    ControlCastResps.push(castResp);
    return [controlEoc];
}