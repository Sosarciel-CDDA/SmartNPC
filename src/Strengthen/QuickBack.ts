import { Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SADef } from "../SADefine";
import { DataManager } from "@sosarciel-cdda/event";

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

export function buildQuickBack(dm: DataManager) {
    const autoback = SADef.genActEoc('AutoQuickBack',[
        {u_cast_spell: {id:QuickBack.id}},
        //{u_message:"<global_val:tmpstr>"},
        //{u_cast_spell: {id:'fireball',min_level:10}},
    ],{and:['u_is_npc',{math:['u_EnableQuickBack','==','1']}]});
    dm.addInvokeID('BattleUpdate',0,autoback.id);
    dm.addData([
        autoback,
        QuickBack,QuickBackSub,QuickBackEoc,
        QuickBackEocSubMovemod,QuickBackEocSubPush
    ],'Strength','QuickBack.json');
}