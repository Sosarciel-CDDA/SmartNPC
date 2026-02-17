import { DataManager } from "@sosarciel-cdda/event";
import { buildSpawnPoint } from "./SpawnPoint";
import { buildCommon } from "./Common";



export const buildSubmod = async (dm:DataManager)=>{
    await buildCommon(dm);
    await buildSpawnPoint(dm);
}