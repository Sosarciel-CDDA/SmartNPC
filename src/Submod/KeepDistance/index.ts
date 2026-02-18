import { ModInfo } from "@sosarciel-cdda/schema";
import { CastAIModInfo } from "../CastAI";
import { DataManager } from "@sosarciel-cdda/event";
import { buildQuickBack } from "./QuickBack";

export const KeepDistanceModinfo: ModInfo = {
    type: "MOD_INFO",
    id: "smartnpc-keepdistance",
    name: "SmartNpc-KeepDistance",
    authors: ["zwa73"],
    maintainers: ["zwa73"],
    description: "添加一个位于[战斗]对话下的选项, 使NPC与怪物保持距离",
    category: "other",
    dependencies: ["dda", CastAIModInfo.id],
    conflicts: ["smartnpc"],
};

export const buildKeepDistance = async (dm:DataManager)=>{
    await buildQuickBack(dm);
    dm.addData([KeepDistanceModinfo],"KeepDistance",'modinfo.json');
}