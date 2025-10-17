import { DataManager } from "@sosarciel-cdda/event";

const mom = [
    {
        id: "classless_toggleable_concentration_end",
        type: "SPELL",
        "copy-from":"classless_toggleable_concentration_end",
        magic_type: "mom_psionics",
    },
    {
        id: "classless_specific_concentration_end",
        type: "SPELL",
        "copy-from":"classless_specific_concentration_end",
        magic_type: "mom_psionics",
    },
];


export const buildMomOverride = (dm: DataManager) => {
    dm.addData([...mom], "mod_interactions", "mindovermatter", "Override");
};