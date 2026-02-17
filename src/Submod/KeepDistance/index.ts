import { ModInfo } from "@sosarciel-cdda/schema";
import { CastAIModInfo } from "../CastAI";
import { DataManager } from "@sosarciel-cdda/event";
import { buildQuickBack } from "./QuickBack";

export const KeepDistanceModinfo:ModInfo = {
    "type": "MOD_INFO",
    id:"smartnpc-keepdistance",
    name:"SmartNpc-KeepDistance",
    "authors": ["zwa73"],
    "maintainers": ["zwa73"],
    "description": "允许在战斗对话使npc与怪物保持距离",
    "category": "other",
    "dependencies": ["dda",CastAIModInfo.id]
}

export const buildKeepDistance = async (dm:DataManager)=>{
    await buildQuickBack(dm);
    dm.addData([KeepDistanceModinfo],"KeepDistance",'modinfo.json');
}