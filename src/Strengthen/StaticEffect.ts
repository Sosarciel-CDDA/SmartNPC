import { DataManager } from "@sosarciel-cdda/event";
import { Effect, Eoc, JM, Mutation, Spell, TalkTopic } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SNDef } from "@/src/Define";

/**取消逃跑效果 */
const Courage:Effect={
    type:"effect_type",
    id:SNDef.genEffectID("Courage"),
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
    id:SNDef.genMutationID('SmartNpc'),
    flags:[
        'NO_SPELLCASTING','NO_PSIONICS',
        "NO_THORNWITCHERY", "NO_FEY_MAGIC",
        "NO_HEDGE_MAGICK", "NO_VAMPIRE_BLOOD_POWERS",
        "NO_WEREWOLF_POWERS"
    ] as any,//关闭自动施法
    name:"NPC属性优化",
    description:"NPC属性优化",
    points:0,
    purifiable:false,
    valid:false,
    player_display:false,
    enchantments:[{
        condition:'ALWAYS',
        values:[
            { value:'AVOID_FRIENDRY_FIRE' , add:1  },
            { value:'PAIN'                , multiply:-1   },//移除疼痛
            { value:'PAIN_REMOVE'         , multiply:10   },
            { value:'MAX_MANA'            , add:6000      },//模拟耐力补正
            { value:'REGEN_MANA'          , multiply:0.5  },
            { value:'SKILL_RUST_RESIST'   , add:100       },//移除技能遗忘
        ],
        ench_effects:[{
            effect:Courage.id,
            intensity:1
        }]
    }]
}


//战斗距离
const BattleRange = 20;

//灵能响应等级锁
const PsionicDrainLock = SNDef.genVarID('PsionicDrainLock');
const uPsiVit = JM.vitamin('u',"'vitamin_psionic_drain'");

//控制队友初始化
const controlNPCEoc:Eoc = {
    id:SNDef.genEocID('ControlNpc'),
    type:"effect_on_condition",
    eoc_type:"ACTIVATION",
    effect:[
        {u_add_trait:SmartNpcMut.id},
        {npc_lose_trait:SmartNpcMut.id},
        {math:[`u_${PsionicDrainLock}`,'=',uPsiVit]},
        "take_control",
    ],
}

//对话
const controlNPCTalkTopic:TalkTopic={
    type:"talk_topic",
    id:["TALK_ALLY_ORDERS"],
    insert_before_standard_exits:true,
    responses:[{
        text:`控制队友`,
        effect:{run_eocs:[controlNPCEoc.id]},
        topic:"TALK_DONE"
    }]
}


//定期清空需求值
const resetNeed:Eoc = {
    id:SNDef.genEocID('ResetNeed'),
    type:"effect_on_condition",
    eoc_type:"RECURRING",
    recurrence: '12 h',
    effect:[
        { math: [JM.vitamin('u',`'redcells'`),'=','0'] },
        { math: [JM.vitamin('u',`'bad_food'`),'=','0'] },
        { math: [JM.vitamin('u',`'blood'`),'=','0'] },
        { math: [JM.vitamin('u',`'instability'`),'=','0'] },
        //{ math: [JM.val('u',`'hunger'`),'=','0'] },
        { math: [JM.val('u',`'thirst'`),'=','0'] },
        { math: [JM.val('u',`'sleepiness'`),'=','0'] },
        { math: [JM.val('u',`'sleep_deprivation'`),'=','0'] },
    ],
    condition:'u_is_npc'
}

//清空灵能响应效果
const psionicDrainLockEoc:Eoc = {
    type:"effect_on_condition",
    id:SNDef.genEocID('PsionicDrainLock'),
    effect:[
        {if:"u_is_avatar",
            then:[
                {math:[`u_${PsionicDrainLock}`,'=',uPsiVit]},
            ],
            else:[
                {math:[uPsiVit,'-=','1']},
                {if:{math:[uPsiVit,'>',`u_${PsionicDrainLock}`]},
                    then:[{math:[uPsiVit,'=',`u_${PsionicDrainLock}`]}],
                    else:[{math:[`u_${PsionicDrainLock}`,'=',uPsiVit]}]}
            ]},
    ],
    condition:{mod_is_loaded:"mindovermatter"}
}

const psionicDrainLock_CastSpell:Eoc = {
    type:"effect_on_condition",
    id:SNDef.genEocID('PsionicDrainLock_CastSpell'),
    eoc_type:"EVENT",
    required_event:"character_casts_spell",
    effect:[{run_eocs:[psionicDrainLockEoc.id]}],
    condition:{mod_is_loaded:"mindovermatter"}
}

export async function buildStaticEffect(dm:DataManager){
    //初始化
    const initNpcStrength = SNDef.genActEoc('InitSmartNpcStrength',[
        {u_add_trait:SmartNpcMut.id},
    ],{and:["u_is_npc",{not:{u_has_trait:SmartNpcMut.id}}]});
    dm.addInvokeID('Init',0,initNpcStrength.id);
    dm.addInvokeID('EnterBattle',0,initNpcStrength.id);
    dm.addInvokeID('SlowUpdate' ,0 ,initNpcStrength.id);

    //回收SmartNpc变异
    const removeAvatarStrength = SNDef.genActEoc('removeAvatarStrength',[
        {u_lose_effect:Courage.id},
        {u_lose_trait:SmartNpcMut.id},
    ],'u_is_avatar');
    dm.addInvokeID('SlowUpdate',0,removeAvatarStrength.id);


    //加入战斗
    const joinBattleSpell:Spell = {
        id:SNDef.genSpellID('JoinBattleSpell'),
        name:"加入战斗",
        description:"使周围友军加入战斗",
        type:"SPELL",
        effect:"effect_on_condition",
        effect_str:dm.getHelperEoc("TryJoinBattle").id,
        min_aoe:BattleRange, max_aoe:BattleRange,
        min_range:1,max_range:1,
        shape:"blast",
        valid_targets:['ally','self'],
        teachable:false,
        flags:[...CON_SPELL_FLAG],
    }
    const joinBattle = SNDef.genActEoc('JoinBattle',[{u_cast_spell:{id:joinBattleSpell.id}}]);
    dm.addInvokeID("EnterBattle",0,joinBattle.id);

    //灵能响应锁
    dm.addInvokeID("SlowUpdate",0,psionicDrainLockEoc.id);

    dm.addData([
        controlNPCTalkTopic,controlNPCEoc,resetNeed,psionicDrainLockEoc,psionicDrainLock_CastSpell,
        initNpcStrength,Courage,SmartNpcMut,removeAvatarStrength,
        joinBattle,joinBattleSpell,
    ],'Strength','StaticEffect.json');
}