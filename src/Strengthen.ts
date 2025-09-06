import { DataManager } from "@sosarciel-cdda/event";
import { Effect, Mutation, Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { SADef } from "./SADefine";

// 战斗规则对话ID
export const CombatRuleTopicID = SADef.genTalkTopicID(`CombatRule`);

/**用于必定成功的控制法术的flags */
export const CON_SPELL_FLAG = [
    "SILENT",
    "NO_HANDS",
    "NO_LEGS",
    "NO_FAIL",
    "NO_EXPLOSION_SFX",
] as const;

/**战术转移 */
const TacticalTransfer: Spell = {
    type: "SPELL",
    id: "tactical_transfer",
    description: "传送到视野范围内的另一个位置。",
    name: "战术转移",
    valid_targets: ["ground"],
    effect: "effect_on_condition",
    min_range: 30,
    shape: "blast",
    flags: [...CON_SPELL_FLAG],
    effect_str:"tactical_transfer_eoc",
};
const TacticalTransferEoc = {
    type: "effect_on_condition",
    id: "tactical_transfer_eoc",
    eoc_type: "ACTIVATION",
    effect: [
        {npc_teleport: {global_val: "tactical_transfer_control_cast_loc",}}
    ],
};



const QuickBackRange = 10;

/**快速后退击退子法术 */
const QuickBackEocSubPush: Spell = {
    type: "SPELL",
    id: "quick_back_eoc_pushsub",
    description: "快速后退委托击退法术",
    name: "快速后退委托击退法术",
    valid_targets: ["hostile","ally","self"],
    effect: "directed_push",
    min_range: QuickBackRange,
    min_damage: 1,
    max_damage: 1,
    shape: "blast",
    flags: [...CON_SPELL_FLAG],
}
/**快速后退移动调整子法术 */
const QuickBackEocSubMovemod: Spell = {
    type: "SPELL",
    id: "quick_back_eoc_movemodsub",
    description: "快速后退委托movemod法术",
    name: "快速后退委托movemod法术",
    valid_targets: ["hostile","ally","self"],
    effect: "mod_moves",
    min_range: QuickBackRange,
    min_damage: 50,
    max_damage: 50,
    shape: "blast",
    flags: [...CON_SPELL_FLAG],
}
/**快速后退施法委托 */
const QuickBackEoc = SADef.genActEoc('QuickBack',[
    {npc_location_variable:{context_val:"tmploc"}},
    {u_cast_spell: {id:QuickBackEocSubPush.id},loc:{context_val:'tmploc'}},
    {u_cast_spell: {id:QuickBackEocSubMovemod.id},loc:{context_val:'tmploc'}}
],{or:['u_is_character','u_is_monster']});
/**快速后退 */
const QuickBackSub: Spell = {
    type: "SPELL",
    id: "quick_back_sub",
    description: "快速后退子法术",
    name: "快速后退子法术",
    valid_targets: ["hostile"],
    effect: "effect_on_condition",
    min_range: QuickBackRange,
    shape: "blast",
    flags: [...CON_SPELL_FLAG,'RANDOM_TARGET'],
    effect_str:QuickBackEoc.id,
}
/**快速后退 */
const QuickBack: Spell = {
    type: "SPELL",
    id: "quick_back",
    description: "快速后退",
    name: "快速后退",
    valid_targets: ["self"],
    effect: "attack",
    shape: "blast",
    flags: [...CON_SPELL_FLAG],
    extra_effects:[{id:QuickBackSub.id}]
}
//战斗对话
const CombatRuleTalkTopic:TalkTopic={
    type:"talk_topic",
    id:CombatRuleTopicID,
    insert_before_standard_exits:true,
    dynamic_line:"<mypronoun>应该做些什么？",
    responses:[{
        truefalsetext:{
            condition:{math:['n_EnableQuickBack',"==","1"]},
            true:`不要再和怪物保持射击距离了。`,
            false:`和怪物保持射击距离。`,
        },
        effect:{run_eocs:{
            id:SADef.genEOCID('QuickBackTopicSwitch'),
            eoc_type:'ACTIVATION',
            effect:[{math:['n_EnableQuickBack',"=","0"]}],
            false_effect:[{math:['n_EnableQuickBack',"=","1"]}],
            condition:{math:['n_EnableQuickBack',"==","1"]},
        }},
        topic:CombatRuleTopicID,
    },
    { text: "Never mind.", topic: "TALK_DONE" }]
}


/**取消逃跑效果 */
const Courage:Effect={
    type:"effect_type",
    id:SADef.genEffectID("Courage"),
    name:["勇气"],
    desc:["npc不会逃跑"],
    removes_effects:["npc_run_away"],
}

//Npc属性优化
export const SmartNpcMut:Mutation={
    type:'mutation',
    id:SADef.genMutationID('SmartNpc'),
    flags:['NO_SPELLCASTING'] as any,//关闭自动施法
    name:"Npc属性优化",
    description:"Npc属性优化",
    points:0,
    purifiable:false,
    valid:false,
    player_display:false,
    //enchantments:[{
    //    condition:'ALWAYS',
    //    ench_effects:[{
    //        effect:'AVOID_FRIENDRY_FIRE',
    //        intensity:1.0,
    //    }]
    //}]
}

/**构建强化数据，将指定的战术转移和快速回退相关数据添加到数据管理器中。
 * @param dm - 数据管理器实例，用于添加数据。
 * @returns 无返回值，异步操作完成后数据将被添加。
 */
export async function buildStrengthen(dm:DataManager){
    const autoback = SADef.genActEoc('AutoQuickBack',[
        {u_cast_spell: {id:QuickBack.id}},
        //{u_message:"<global_val:tmpstr>"},
        //{u_cast_spell: {id:'fireball',min_level:10}},
    ],{and:['u_is_npc',{math:['u_EnableQuickBack','==','1']}]});
    dm.addInvokeID('BattleUpdate',0,autoback.id);

    const initNpcStrength = SADef.genActEoc('InitSmartNpcStrength',[
        {u_add_effect:Courage.id,duration:'PERMANENT'},
        {u_add_trait:SmartNpcMut.id},
    ],'u_is_npc');
    dm.addInvokeID('Init',0,initNpcStrength.id);
    dm.addInvokeID('EnterBattle',0,initNpcStrength.id);

    const removeAvatarStrength = SADef.genActEoc('removeAvatarStrength',[
        {u_lose_effect:Courage.id},
        {u_lose_trait:SmartNpcMut.id},
    ],'u_is_avatar');
    dm.addInvokeID('SlowUpdate',0,removeAvatarStrength.id);

    dm.addData([
        autoback,TacticalTransfer,TacticalTransferEoc,
        QuickBack,QuickBackSub,QuickBackEoc,
        QuickBackEocSubMovemod,QuickBackEocSubPush,CombatRuleTalkTopic,
        initNpcStrength,Courage,SmartNpcMut,removeAvatarStrength
    ],'strength.json');
}