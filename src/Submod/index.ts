import { DataManager } from "@sosarciel-cdda/event";
import { buildSpawnPoint } from "./SpawnPoint";
import { buildCommon } from "./Common";
import { buildCastAI } from "./CastAI";
import { buildTacticalTransfer } from "./TacticalTransfer";
import { buildKeepDistance } from "./KeepDistance";



export const buildSubmod = async (dm:DataManager)=>{
    return await Promise.all([
        buildCommon(dm),
        buildSpawnPoint(dm),
        buildCastAI(dm),
        buildTacticalTransfer(dm),
        buildKeepDistance(dm),
    ]);
}