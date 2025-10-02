import { Eoc } from "@sosarciel-cdda/schema";
import { SADef } from "../Define";
import { DataManager } from "@sosarciel-cdda/event";



/**完全回复EOC */
export const EOC_FULL_RECIVERY = SADef.genEocID("FullRecovery");
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
        { math: ["u_pain()", "=", "0"] },
        { math: ["u_val('rad')", "=", "0"] },
        { math: ["u_hp('ALL')", "=", "999"] },
        //{ u_set_hp: 1000, max: true},
        { u_add_effect: "cureall", duration: "1 s", intensity: 1 },
        { u_add_effect: "panacea", duration: "30 s", intensity: 1 },
        { u_lose_effect: "corroding" },
        { u_lose_effect: "onfire" },
        { u_lose_effect: "dazed" },
        { u_lose_effect: "stunned" },
        { u_lose_effect: "venom_blind" },
        { u_lose_effect: "formication" },
        { u_lose_effect: "blisters" },
        { u_lose_effect: "frostbite" },
        { u_lose_effect: "frostbite_recovery" },
        { u_lose_effect: "wet" },
        { u_lose_effect: "slimed" },
        { u_lose_effect: "migo_atmosphere" },
        { u_lose_effect: "fetid_goop" },
        { u_lose_effect: "sap" },
        { u_lose_effect: "nausea" },
        { u_lose_effect: "bleed" },
    ],
};

export async function createUtilEoc(dm:DataManager){
    dm.addData([
        FullRecivery
    ],"Common","Eoc");
}

