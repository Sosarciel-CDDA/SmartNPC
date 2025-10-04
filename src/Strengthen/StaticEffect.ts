import { DataManager } from "@sosarciel-cdda/event";
import { Effect, Mutation, Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SADef } from "@/src/Define";
import { CombatRuleTopicID } from "@/src/Define";


/**取消逃跑效果 */
const Courage:Effect={
    type:"effect_type",
    id:SADef.genEffectID("Courage"),
    name:["勇气"],
    desc:["npc不会逃跑"],
    removes_effects:[
        "npc_run_away",
        "npc_flee_player"
    ],
}

//Npc属性优化
const SmartNpcMut:Mutation={
    type:'mutation',
    id:SADef.genMutationID('SmartNpc'),
    flags:['NO_SPELLCASTING'] as any,//关闭自动施法
    name:"Npc属性优化",
    description:"Npc属性优化",
    points:0,
    purifiable:false,
    valid:false,
    player_display:false,
    enchantments:[{
        condition:'ALWAYS',
        values:[
            { value:'AVOID_FRIENDRY_FIRE', add:1 },
            { value:'PAIN'       , multiply:-1 },
            { value:'PAIN_REMOVE', multiply:10 },
        ],
        ench_effects:[{
            effect:Courage.id,
            intensity:1
        }]
    }]
}

//战斗距离
const BattleRange = 20;

export async function buildStaticEffect(dm:DataManager){
    const initNpcStrength = SADef.genActEoc('InitSmartNpcStrength',[
        {u_add_trait:SmartNpcMut.id},
    ],'u_is_npc');
    dm.addInvokeID('Init',0,initNpcStrength.id);
    dm.addInvokeID('EnterBattle',0,initNpcStrength.id);

    const removeAvatarStrength = SADef.genActEoc('removeAvatarStrength',[
        {u_lose_effect:Courage.id},
        {u_lose_trait:SmartNpcMut.id},
    ],'u_is_avatar');
    dm.addInvokeID('SlowUpdate',0,removeAvatarStrength.id);


    const joinBattleSpell:Spell = {
        id:SADef.genSpellID('JoinBattleSpell'),
        name:"加入战斗",
        description:"使周围友军加入战斗",
        type:"SPELL",
        effect:"effect_on_condition",
        effect_str:dm.getHelperEoc('TryJoinBattle').id,
        min_aoe:BattleRange, max_aoe:BattleRange,
        min_range:1,max_range:1,
        shape:"blast",
        valid_targets:['ally','self'],
        flags:[...CON_SPELL_FLAG],
    }
    const joinBattle = SADef.genActEoc('JoinBattle',[{u_cast_spell:{id:joinBattleSpell.id}}]);
    dm.addInvokeID("EnterBattle",0,joinBattle.id);

    dm.addData([
        initNpcStrength,Courage,SmartNpcMut,removeAvatarStrength,
        joinBattle,joinBattleSpell
    ],'Strength','StaticEffect.json');
}