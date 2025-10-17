
//data/mods/Xedra_Evolved/mutations

import { DataManager } from "@sosarciel-cdda/event";

//移除激活
const xedra = [
    {
        type: "mutation",
        id: "ethereal_wings",
        name: { str: "Ethereal Wings" },
        active: true,
        points: 1,
        visibility: 10,
        description:
            "A wide set of ethereal wings sprouts from your back.  Despite them phasing through every form of matter you've encountered, they still somehow lift you off the ground.  Their mere appearance makes you feel lighter",
        valid: false,
        starting_trait: false,
        purifiable: false,
        "//": "No body part is intentional.  The wings should not be attackable by enemies or get in the way of clothes or armor.  These are also intended as less of a wide stat boost than the other dream toggleable mutations and instead specifically allow flight and carry weight.",
        enchantments: [
            {
                values: [
                    {
                        value: "CARRY_WEIGHT",
                        add: { math: ["2500 * u_spell_level('spell_ethereal_wings')"] },
                    },
                ],
                ench_effects: [{ effect: "effect_vampire_bat_form_levitation", intensity: 1 }],
            },
            { values: [{ value: "MAX_MANA", multiply: -0.2 }] },
        ],
        flags: ["GLIDE", "FEATHER_FALL"],
    },
    {
        type: "mutation",
        id: "karma_arms",
        name: { str: "Karma" },
        active: true,
        points: 1,
        visibility: 10,
        description:
            "Ethereal hands appear behind your back, making you looks like an ancient god.",
        valid: false,
        starting_trait: false,
        purifiable: false,
        enchantments: [
            {
                condition: "ALWAYS",
                modified_bodyparts: [
                    { gain: "karma_arm_up_r" },
                    { gain: "karma_arm_up_l" },
                    { gain: "karma_arm_lw_r" },
                    { gain: "karma_arm_lw_l" },
                ],
            },
            { values: [{ value: "MAX_MANA", multiply: -0.1 }] },
        ],
    },
    {
        type: "mutation",
        id: "devil_tail",
        name: { str: "Devil's Tail" },
        active: true,
        points: 1,
        visibility: 6,
        description:
            "While not actually a devil's, this long, triangular pointed tail can stretch very far, allowing it to easily kill someone nearby.",
        valid: false,
        starting_trait: false,
        purifiable: false,
        enchantments: [
            { condition: "ALWAYS", modified_bodyparts: [{ gain: "devil_tail" }] },
            { values: [{ value: "MAX_MANA", multiply: -0.1 }] },
        ],
    },
    {
        type: "mutation",
        id: "stalker_eyes",
        name: { str: "Stalker's Vision" },
        active: true,
        points: 1,
        visibility: 1,
        description:
            "Your eyes transform into the orbits of an unknown creature.  You now see much better in the light and dark.",
        "//": "not actual replacement yet, because i'm afraid of how wearing stuff may interact with it",
        valid: false,
        starting_trait: false,
        purifiable: false,
        enchantments: [
            { condition: "ALWAYS", modified_bodyparts: [{ gain: "stalker_eyes" }] },
            { values: [{ value: "MAX_MANA", multiply: -0.1 }] },
        ],
    },
];



export const buildXedraOverride = (dm:DataManager)=>{
    dm.addData([
        ...xedra,
    ],'mod_interactions','xedra_evolved','Override');
}