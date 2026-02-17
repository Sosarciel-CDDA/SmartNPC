import { DataManager } from "@sosarciel-cdda/event";
import { buildSpawnPoint } from "./SpawnPoint";
import { buildCommon } from "./Common";
import { buildCastAI } from "./CastAI";
import { buildStrengthen } from "./Strengthen";



export const buildSubmod = async (dm:DataManager)=>{
    await buildCommon(dm);
    await buildSpawnPoint(dm);
    await buildCastAI(dm);
    await buildStrengthen(dm);
}