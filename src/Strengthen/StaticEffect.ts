import { DataManager } from "@sosarciel-cdda/event";
import { Effect, Eoc, JM, Mutation, Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SADef } from "@/src/Define";
import { CombatRuleTopicID } from "@/src/Define";


/**取消逃跑效果 */
const Courage:Effect={
    type:"effect_type",
    id:SADef.genEffectID("Courage"),
    name:["勇气"],
    desc:["NPC不会逃跑, 不会陷入攫抓状态"],
    removes_effects:[
        "npc_run_away"   ,//移除逃跑
        "npc_flee_player",
        "grabbed"        ,//移除攫抓
    ],
}

//Npc属性优化
const SmartNpcMut:Mutation={
    type:'mutation',
    id:SADef.genMutationID('SmartNpc'),
    flags:['NO_SPELLCASTING','NO_PSIONICS'] as any,//关闭自动施法
    name:"NPC属性优化",
    description:"NPC属性优化",
    points:0,
    purifiable:false,
    valid:false,
    player_display:false,
    enchantments:[{
        condition:'ALWAYS',
        values:[
            { value:'AVOID_FRIENDRY_FIRE', add:1  },
            { value:'PAIN'        , multiply:-1   },//移除疼痛
            { value:'PAIN_REMOVE' , multiply:10   },
            { value:'MAX_MANA'    , add:6000      },//模拟耐力补正
            { value:'REGEN_MANA'  , multiply:0.5  },
        ],
        ench_effects:[{
            effect:Courage.id,
            intensity:1
        }]
    }]
}

//战斗距离
const BattleRange = 20;

//对话
const talkTopic:TalkTopic={
    type:"talk_topic",
    id:["TALK_ALLY_ORDERS"],
    insert_before_standard_exits:true,
    responses:[{
        text:`控制队友`,
        effect:"take_control",
        topic:"TALK_DONE"
    }]
}


//定期清空需求值
const resetNeed:Eoc = {
    id:SADef.genEocID('ResetNeed'),
    type:"effect_on_condition",
    eoc_type:"RECURRING",
    recurrence: '12 h',
    effect:[
        { math: [JM.vitamin('u',`'redcells'`),'=','0'] },
        { math: [JM.vitamin('u',`'bad_food'`),'=','0'] },
        { math: [JM.vitamin('u',`'blood'`),'=','0'] },
        { math: [JM.vitamin('u',`'instability'`),'=','0'] },
        { math: [JM.val('u',`'hunger'`),'=','0'] },
        { math: [JM.val('u',`'thirst'`),'=','0'] },
        { math: [JM.val('u',`'sleepiness'`),'=','0'] },
        { math: [JM.val('u',`'sleep_deprivation'`),'=','0'] },
    ],
    condition:'u_is_npc'
}


export async function buildStaticEffect(dm:DataManager){
    const initNpcStrength = SADef.genActEoc('InitSmartNpcStrength',[
        {u_add_trait:SmartNpcMut.id},
    ],{and:["u_is_npc",{not:{u_has_trait:SmartNpcMut.id}}]});
    dm.addInvokeID('Init',0,initNpcStrength.id);
    dm.addInvokeID('EnterBattle',0,initNpcStrength.id);
    dm.addInvokeID('SlowUpdate' ,0 ,initNpcStrength.id);

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
        teachable:false,
        flags:[...CON_SPELL_FLAG],
    }
    const joinBattle = SADef.genActEoc('JoinBattle',[{u_cast_spell:{id:joinBattleSpell.id}}]);
    dm.addInvokeID("EnterBattle",0,joinBattle.id);

    dm.addData([
        talkTopic,resetNeed,
        initNpcStrength,Courage,SmartNpcMut,removeAvatarStrength,
        joinBattle,joinBattleSpell
    ],'Strength','StaticEffect.json');
}