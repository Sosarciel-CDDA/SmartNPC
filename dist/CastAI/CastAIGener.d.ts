import { EocID, Spell } from "cdda-schema";
import { JToken } from "@zwa73/utils";
import { CastCond } from "./CastAIInterface";
export declare function revTalker<T extends JToken>(obj: T): T;
/**解析NumObj为math表达式 */
export declare function parseNumObj(value?: any): string;
/**解析法术伤害字符串 */
export declare function parseSpellNumObj(spell: Spell, field: keyof Spell, def?: number): string;
/**生成施法eocid */
export declare function genCastEocID(spell: Spell, cast_condition: CastCond): EocID;
/**生成施法true_eoc id */
export declare function genTrueEocID(spell: Spell, cast_condition: CastCond): EocID;
/**使某个技能停止使用的变量 */
export declare function getDisableSpellVar(talker: "u" | "n", spell: Spell): string;
