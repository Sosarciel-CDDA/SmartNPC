import { Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG, SADef, MAX_NUM } from "./SADefine";
import { DataManager } from "@sosarciel-cdda/event";
import { JObject } from "@zwa73/utils";


/**施法后摇变量 */
export const SPELL_CT_MODMOVE_VAR = 'casttime_modmove';
/**施法后摇法术ID */
export const SPELL_CT_MODMOVE = SADef.genSpellID(`CastTimeModMove`);
/**加速一回合 */
export const SPELL_G1T = SADef.genSpellID("Gain1Turn");
/**扣除一回合 */
export const SPELL_L1T = SADef.genSpellID("Lose1Turn");
/**扣除一tick */
export const SPELL_L1Tick = SADef.genSpellID("Lose1Tick");
export async function createUtilSpell(dm:DataManager){
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
    const gain1Turn:Spell ={
        id: SPELL_G1T,
        type: "SPELL",
        name: "获得一回合",
        description: "获得一回合移动调整",
        effect: "mod_moves",
        shape: "blast",
        valid_targets: ["self"],
        flags: [...CON_SPELL_FLAG],
        min_damage:100,
        max_damage:100
    }
    out.push(gain1Turn);
    const lose1Turn:Spell ={
        id: SPELL_L1T,
        type: "SPELL",
        name: "失去一回合",
        description: "失去一回合移动调整",
        effect: "mod_moves",
        shape: "blast",
        valid_targets: ["self"],
        flags: [...CON_SPELL_FLAG],
        min_damage:-100,
        max_damage:-100
    }
    out.push(lose1Turn);
    const lose1Tick:Spell ={
        id: SPELL_L1Tick,
        type: "SPELL",
        name: "失去一回合",
        description: "失去一回合移动调整",
        effect: "mod_moves",
        shape: "blast",
        valid_targets: ["self"],
        flags: [...CON_SPELL_FLAG],
        min_damage:-1,
        max_damage:-1
    }
    out.push(lose1Tick);
    dm.addData(out,"UtilSpell");
}

