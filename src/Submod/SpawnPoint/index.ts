import { DataManager } from "@sosarciel-cdda/event";
import { CommonModinfo } from "../Common";
import { buildProtect } from "./Protect";
import { ModInfo } from "@sosarciel-cdda/schema";

export * from "./Protect";


const modinfo:ModInfo = {
    "type": "MOD_INFO",
    id:"smartnpc-spawnpoint",
    name:"SmartNpc-SpawnPoint",
    "authors": ["zwa73"],
    "maintainers": ["zwa73"],
    "description": "增加对npc的召集/召回法术, 设置启用重生点的npc与玩家可在死亡时传送至重生点复活",
    "category": "other",
    "dependencies": ["dda",CommonModinfo.id]
}
export const buildSpawnPoint = async (dm:DataManager)=>{
    dm.addData([modinfo],"SpawnPoint","modinfo");
    await buildProtect(dm);
}