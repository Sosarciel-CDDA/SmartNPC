import { ModDefine, Spell, SpellID } from "cdda-schema";
/**mod物品前缀 */
export declare const MOD_PREFIX = "CAI";
export declare const SADef: ModDefine;
/**默认最大数字 */
export declare const MAX_NUM = 1000000;
/**用于必定成功的控制法术的flags */
export declare const CON_SPELL_FLAG: readonly ["SILENT", "NO_HANDS", "NO_LEGS", "NO_FAIL", "NO_EXPLOSION_SFX"];
/**根据id从 ./spell 目录中寻找法术 */
export declare function getSpellByID(id?: SpellID): Spell;
export declare const DATA_PATH: string;
export declare const ENV_PATH: string;
export declare const GAME_PATH: string;
export declare const OUT_PATH: string;
