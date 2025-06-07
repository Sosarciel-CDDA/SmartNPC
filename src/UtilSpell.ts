import { Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SADef, MAX_NUM } from "./SADefine";
import { DataManager } from ""@sosarciel-cdda/event";
import { JObject } from "@zwa73/utils";


/**施法后摇变量 */
export const SPELL_CT_MODMOVE_VAR = 'casttime_modmove';
/**施法后摇法术ID */
export const SPELL_CT_MODMOVE = SADef.genSpellID(`CastTimeModMove`);
/**加速一回合 */
export const SPELL_M1T = SADef.genSpellID("Mod1Turn");
export async function utilSpell(dm:DataManager){
    const out:JObject[] = [];
    const spellCT:Spell = {
        id: SPELL_CT_MODMOVE,
        type: "SPELL",
        name: "施法后摇",
        description: "施法后摇",
        effect: "mod_moves",
        shape: "blast",
        valid_targets: ["self"],
        flags: [...CON_SPELL_FLAG],
        min_damage: {math:[`0-${SPELL_CT_MODMOVE_VAR}`]},
        max_damage: MAX_NUM,
    }
    out.push(spellCT);
    const mod1Turn:Spell ={
        id: SPELL_M1T,
        type: "SPELL",
        name: "加速一回合",
        description: "获得一回合移动调整",
        effect: "mod_moves",
        shape: "blast",
        valid_targets: ["self"],
        flags: [...CON_SPELL_FLAG],
        min_damage:100,
        max_damage:100
    }
    out.push(mod1Turn);
    dm.addData(out,"UtilSpell");
}

