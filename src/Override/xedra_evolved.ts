//data/mods/Xedra_Evolved/mutations
import path from 'pathe';
import { DataManager } from "@sosarciel-cdda/event";

//移除施法
const xedra = [
    {
        id: "xedra_magic_generic",
        type: "magic_type",
        energy_source: "MANA",
        cannot_cast_flags:'NO_SPELLCASTING',
    },
    {
        id: "xedra_dream_magic",
        type: "magic_type",
        energy_source: "MANA",
        get_level_formula_id: "xedra_dream_formula_get_level",
        exp_for_level_formula_id: "xedra_dream_formula_exp_for_level",
        casting_xp_formula_id: "xedra_dream_casting_xp_formula",
        failure_cost_percent: 0.1,
        failure_exp_percent: 1,
        max_book_level: 0,
        cannot_cast_flags:'NO_SPELLCASTING',
    },
];

export const buildXedraOverride = (dm: DataManager,...outpath:string[]) => {
    dm.addData([...xedra], path.join(...outpath),"mod_interactions", "xedra_evolved", "Override");
};
