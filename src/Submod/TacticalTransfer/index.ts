import { ModInfo } from "@sosarciel-cdda/schema";
import { CastAIModInfo } from "../CastAI";
import { DataManager } from "@sosarciel-cdda/event";
import { buildTeleport } from "./TacticalTransfer";

const modinfo:ModInfo = {
    "type": "MOD_INFO",
    id:"smartnpc-tacticaltransfer",
    name:"SmartNpc-TacticalTransfer",
    "authors": ["zwa73"],
    "maintainers": ["zwa73"],
    "description": "允许在施法对话使npc在使用一个30秒CD的短距传送法术",
    "category": "other",
    "dependencies": ["dda",CastAIModInfo.id]
}

export const buildTacticalTransfer = async (dm:DataManager)=>{
    await buildTeleport(dm);
    dm.addData([modinfo],"TacticalTransfer",'modinfo.json');
}