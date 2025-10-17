import { DataManager } from "@sosarciel-cdda/event";
import { createMathFunc } from "./MathFunc";
import { createUtilSpell } from "./UtilSpell";
import { createUtilEoc } from "./UtilEoc";
import { createUtilTalkTopic } from "./UtilTopic";
import { createUtilMagicType } from "./Other";
export * from "./UtilEoc";
export * from "./UtilSpell";
export * from "./UtilTopic";
export * from "./MathFunc";
export * from "./Other";


export async function buildCommon(dm:DataManager){
    return Promise.all([
        createMathFunc(dm),
        createUtilSpell(dm),
        createUtilEoc(dm),
        createUtilTalkTopic(dm),
        createUtilMagicType(dm),
    ])
}
