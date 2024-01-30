import { DataManager } from "cdda-event";
/**施法后摇变量 */
export declare const SPELL_CT_MODMOVE_VAR = "casttime_modmove";
/**施法后摇法术ID */
export declare const SPELL_CT_MODMOVE: import("cdda-schema").SpellID;
/**加速一回合 */
export declare const SPELL_M1T: import("cdda-schema").SpellID;
export declare function utilSpell(dm: DataManager): Promise<void>;
