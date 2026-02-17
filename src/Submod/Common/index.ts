import { DataManager } from "@sosarciel-cdda/event";
import { createMathFunc } from "./MathFunc";
import { createUtilSpell } from "./UtilSpell";
import { createUtilEoc } from "./UtilEoc";
import { createUtilTalkTopic } from "./UtilTopic";
import { createUtilMagicType } from "./Other";
import { ModInfo } from "@sosarciel-cdda/schema";
export * from "./UtilEoc";
export * from "./UtilSpell";
export * from "./UtilTopic";
export * from "./MathFunc";
export * from "./Other";

export const CommonModinfo:ModInfo = {
    "type": "MOD_INFO",
    id:"smartnpc-common",
    name:"SmartNpc-Common",
    "authors": ["zwa73"],
    "maintainers": ["zwa73"],
    "description": "SmartNpc共用依赖",
    "category": "other",
    "dependencies": ["dda"]
}

export async function buildCommon(dm:DataManager){
    dm.addData([CommonModinfo],"Common","modinfo");
    return Promise.all([
        createMathFunc(dm),
        createUtilSpell(dm),
        createUtilEoc(dm),
        createUtilTalkTopic(dm),
        createUtilMagicType(dm),
    ])
}
