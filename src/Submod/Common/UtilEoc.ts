import { Eoc } from "@sosarciel-cdda/schema";
import { SNDef } from "../../Define";
import { DataManager } from "@sosarciel-cdda/event";



/**完全回复EOC */
export const EOC_FULL_RECIVERY = SNDef.genEocID("FullRecovery");
/**完全回复 */
const FullRecivery: Eoc = {
    type: "effect_on_condition",
    eoc_type: "ACTIVATION",
    id: EOC_FULL_RECIVERY,
    effect: [
        "u_prevent_death",
        { math: ["u_calories()", "=", "max( u_calories(), 9000)"] },
        { math: ["u_val('thirst')", "=", "min( u_val('thirst'), 800)"] },
        { math: ["u_vitamin('redcells')", "=", "0"] },
        { math: ["u_vitamin('bad_food')", "=", "0"] },
        { math: ["u_vitamin('blood')", "=", "0"] },
        { math: ["u_vitamin('instability')", "=", "0"] },
        { math: ["u_pain()", "=", "0" ] },
        { math: ["u_val('rad')", "=", "0" ] },
        { math: ["u_val('pkill')", "=", "0" ] },
        { math: ["u_hp('ALL')", "=", "999"] },
        //{ u_set_hp: 1000, max: true},
        { u_add_effect: "cureall", duration: "1 s", intensity: 1 },
        { u_add_effect: "panacea", duration: "30 s", intensity: 1 },
        { u_lose_effect: [
            "corroding",
            "onfire",
            "dazed",
            "stunned",
            "venom_blind",
            "formication",
            "blisters",
            "frostbite",
            "frostbite_recovery",
            "wet",
            "slimed",
            "migo_atmosphere",
            "fetid_goop",
            "sap",
            "nausea",
            "bleed",
            "fungus",
            "dermatik",
            "bloodworms",
            "paincysts",
            "brainworms",
            "tapeworm",
            "blind",
            "poison",
            "venom_dmg",
            "venom_weaken",
            "stung",
            "badpoison",
            "foodpoison",
            "paralyzepoison",
            "tetanus",
            "rat_bite_fever",
            "infected",
            "asthma",
            "common_cold",
            "flu",
            "pre_flu",
            "pre_common_cold",
            "VITRIFYING"
        ]},
    ],
};

/**发送消息EOC */
export const EOC_SEND_MESSAGE = SNDef.genEocID("SendMessage");
export const EOC_SEND_MESSAGE_VAR = SNDef.genVarID("SendMessage_Var");
/**发送消息 */
const SendMessage: Eoc = {
    type: "effect_on_condition",
    eoc_type: "ACTIVATION",
    id: EOC_SEND_MESSAGE,
    effect:[{u_message:{global_val:EOC_SEND_MESSAGE_VAR}}]
}

export async function createUtilEoc(dm:DataManager){
    dm.addData([
        FullRecivery,SendMessage,
    ],"Common","Eoc");
}

