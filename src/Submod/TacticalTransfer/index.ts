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
    "description": "添加一个NPC[施法]对话下可用的64秒CD短距传送法术",
    "category": "other",
    "dependencies": ["dda",CastAIModInfo.id]
}

export const buildTacticalTransfer = async (dm:DataManager)=>{
    await buildTeleport(dm);
    dm.addData([modinfo],"TacticalTransfer",'modinfo.json');
}