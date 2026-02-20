import { Eoc, Monster, Mutation, NpcClass, NpcInstance, Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SNDef } from "../Define";
import { DataManager } from "@sosarciel-cdda/event";




const MonsterMut: Mutation = {
    id: SNDef.genMutationID("MonsterMut"),
    type: "mutation",
    name: "SmartNPC包装NPC变异",
    description: "SmartNPC包装NPC变异",
    points: 0,
    purifiable: false,
    valid: false,
    player_display: false,
    anger_relations: [["ZOMBIE", -100]],
};

const WrapperNpcClass: NpcClass = {
    type: "npc_class",
    id: SNDef.genNpcClassID(`WrapperNpcClass`),
    name: { str: "丧尸" },
    job_description: "丧尸",
    traits: [
        { group: "NPC_starting_traits" },
        { group: "Appearance_demographics" },
        { trait: MonsterMut.id },
    ],
    skills: [{
        skill: "ALL",
        level: { mul: [{ one_in: 3 }, { sum: [{ dice: [4, 2] }, { rng: [-4, -1] }] }] },
    }],
};

const WrapperNpc:NpcInstance = {
    type: "npc",
    id:SNDef.genNpcInstanceID(`WrapperNpc`),
    class: WrapperNpcClass.id,
    attitude: 10,//尝试杀死玩家
    mission: 0,
    faction: "no_faction",
    chat: "TALK_DONE",
    per:10, str:10, dex:10, int:10,
}

const WrapperEoc:Eoc = {
    id:SNDef.genEocID('WrapperEoc'),
    type:"effect_on_condition",
    effect:[
        {u_spawn_npc:WrapperNpc.id,real_count:1},
    ],
}

const WrapperSpell:Spell = {
    id:SNDef.genSpellID('WrapperSpell'),
    type:"SPELL",
    name:"WrapperSpell",
    description:"SmartNPC的包装法术",
    effect:"effect_on_condition",
    effect_str:WrapperEoc.id,
    valid_targets:["self","ground"],
    flags: [...CON_SPELL_FLAG],
    shape:"blast"
}

const WrapperMonster:Monster = {
    id: SNDef.genMonsterID('WrapperMonster'),
    name:'WrapperMonster',
    '//copy':false,
    type:'MONSTER',
    hp:1,
    looks_like:'null',
    default_faction:'nether',
    description:'SmartNPC的包装怪物',
    volume:'1 ml',
    weight:'1 g',
    speed:1000,
    symbol:'O',
    special_attacks: [ [ "DISAPPEAR", 1 ] ],
    death_function: {
        message:"O",
        corpse_type:"NO_CORPSE",
        effect:{hit_self:true,id:WrapperSpell.id}
    }
}

export const buildNpcMonster = (dm:DataManager)=>{
    dm.addData([MonsterMut,WrapperNpcClass,WrapperNpc,WrapperEoc,WrapperSpell,WrapperMonster],'Monster');
}