import { DataManager } from "@sosarciel-cdda/event";
import { buildSpawnPoint } from "./SpawnPoint";
import { buildCommon } from "./Common";
import { buildCastAI } from "./CastAI";
import { buildTacticalTransfer } from "./TacticalTransfer";
import { buildQuickBack } from "./KeepDistance/QuickBack";



export const buildSubmod = async (dm:DataManager)=>{
    return await Promise.all([
        buildCommon(dm),
        buildSpawnPoint(dm),
        buildCastAI(dm),
        buildTacticalTransfer(dm),
        buildQuickBack(dm),
    ]);
}