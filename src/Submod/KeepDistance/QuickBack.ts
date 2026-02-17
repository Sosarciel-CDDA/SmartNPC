import { Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { CombatRuleTopicID, CON_SPELL_FLAG, SNDef } from "@/src/Define";
import { DataManager } from "@sosarciel-cdda/event";
import { KeepDistanceModinfo } from "./index";

const QuickBackRange = 10;

/**快速后退击退子法术 */
const QuickBackEocSubPush: Spell = {
    type: "SPELL",
    id: "quick_back_eoc_pushsub",
    description: "快速后退委托击退法术",
    name: "快速后退委托击退法术",
    valid_targets: ["hostile","ally","self"],
    teachable:false,
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
    teachable:false,
    effect: "mod_moves",
    min_range: QuickBackRange,
    min_damage: -10,
    max_damage: -10,
    shape: "blast",
    flags: [...CON_SPELL_FLAG],
}
/**快速后退施法委托 */
const QuickBackEoc = SNDef.genActEoc('QuickBack',[
    {npc_location_variable:{context_val:"tmploc"}}, // 记录施法者的位置
    {u_cast_spell: {id:QuickBackEocSubPush.id},loc:{context_val:'tmploc'}}, // 委托怪物对施法者释放一次movemod与一次push
    {u_cast_spell: {id:QuickBackEocSubMovemod.id},loc:{context_val:'tmploc'}}
],{or:['u_is_character','u_is_monster']});
/**快速后退的随机选择怪物法术 */
const QuickBackSub: Spell = {
    type: "SPELL",
    id: "quick_back_sub",
    description: "快速后退子法术",
    name: "快速后退子法术",
    valid_targets: ["hostile"],
    teachable:false,
    effect: "effect_on_condition",
    effect_str:QuickBackEoc.id,
    min_range: QuickBackRange,
    shape: "blast",
    flags: [...CON_SPELL_FLAG,'RANDOM_TARGET'],
}
/**快速后退 */
const QuickBack: Spell = {
    type: "SPELL",
    id: "quick_back",
    description: "快速后退",
    name: "快速后退",
    valid_targets: ["self"],
    teachable:false,
    effect: "attack",
    shape: "blast",
    flags: [...CON_SPELL_FLAG],
    extra_effects:[{id:QuickBackSub.id}]
}

/**快速后退开关变量 */
const QuickBackSwitchVar = 'EnableQuickBack';

//战斗对话
const CombatRuleTalkTopic:TalkTopic={
    type:"talk_topic",
    id:[CombatRuleTopicID],
    insert_before_standard_exits:true,
    dynamic_line:"&<mypronoun>应该做些什么？",
    responses:[{
        truefalsetext:{
            condition:{math:[`n_${QuickBackSwitchVar}`,"==","1"]},
            true:`不要再和怪物保持射击距离了。`,
            false:`和怪物保持射击距离。`,
        },
        effect:{
            if:{math:[`n_${QuickBackSwitchVar}`,"==","1"]},
            then:[{math:[`n_${QuickBackSwitchVar}`,"=","0"]}],
            else:[{math:[`n_${QuickBackSwitchVar}`,"=","1"]}],
        },
        topic:CombatRuleTopicID,
    }]
}

export function buildQuickBack(dm: DataManager) {
    const autoback = SNDef.genActEoc('AutoQuickBack',[
        {u_cast_spell: {id:QuickBack.id}},
        //{u_message:"<global_val:tmpstr>"},
        //{u_cast_spell: {id:'fireball',min_level:10}},
    ],{and:[
        {or:[
            {mod_is_loaded:'smartnpc'},
            {mod_is_loaded:KeepDistanceModinfo.id},
        ]},
        'u_is_npc',
        {math:[`u_${QuickBackSwitchVar}`,'==','1']}
    ]});

    //事件框架位于 CastAI 所以调用Eoc应放入 CastAI 目录
    dm.addInvokeID('BattleUpdate',0,autoback.id);
    dm.addData([autoback],'CastAI','SubmodDep','KeepDistance.json');

    dm.addData([
        CombatRuleTalkTopic,
        QuickBack,QuickBackSub,QuickBackEoc,
        QuickBackEocSubMovemod,QuickBackEocSubPush
    ],'KeepDistance','QuickBack.json');
}