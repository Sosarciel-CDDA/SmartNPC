import { DataManager } from "@sosarciel-cdda/event";
import { buildCastAI } from "./CastAI";
import { DATA_PATH, OUT_PATH } from "./Define";
import { buildStrengthen } from "./Strengthen";
import { buildOverride } from "./Override";
import { buildMonster } from "./Monster";
import { buildSubmod } from "./Submod";






export async function build(){
    const AIDm = new DataManager(DATA_PATH,OUT_PATH,"SNPC_EventFrame",{enableMoveStatus:false});
    await buildSubmod(AIDm);
    await buildCastAI(AIDm);
    await buildStrengthen(AIDm);
    await buildOverride(AIDm);
    await buildMonster(AIDm);
    await AIDm.saveAllData();
}