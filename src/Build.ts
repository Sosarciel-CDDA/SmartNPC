import { DataManager } from "@sosarciel-cdda/event";
import { DATA_PATH, OUT_PATH } from "./Define";
import { buildOverride } from "./Override";
import { buildMonster } from "./Monster";
import { buildSubmod } from "./Submod";






export async function build(){
    const AIDm = new DataManager(DATA_PATH,OUT_PATH,"CastAI/SNPC_EventFrame",{enableMoveStatus:false});
    await buildSubmod(AIDm);
    await buildOverride(AIDm);
    await buildMonster(AIDm);
    await AIDm.saveAllData();
}