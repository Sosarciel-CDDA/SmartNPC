import { Eoc, Monster, Mutation, NpcClass, NpcInstance } from "@sosarciel-cdda/schema";
import { SNDef } from "../Define";
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
        { group: "BG_survival_story_EVACUEE" },
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
    effect:[ {u_spawn_npc:WrapperNpc.id} , 'u_die'],
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
    special_attacks:[{
        allow_no_target:true,
        range:100,
        eoc:[WrapperEoc.id],
    }]
}

export const buildNpcMonster = (dm:DataManager)=>{
    dm.addData([MonsterMut,WrapperNpcClass,WrapperNpc,WrapperEoc,WrapperMonster],'Monster');
}