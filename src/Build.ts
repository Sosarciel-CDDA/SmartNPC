import { DataManager } from "@sosarciel-cdda/event";
import { DATA_PATH, OUT_PATH } from "./Define";
import { buildOverride } from "./Override";
import { buildSubmod } from "./Submod";
import { buildMonster } from "./Monster";






export async function build(){
    const AIDm = new DataManager({
        dataPath:DATA_PATH,
        outPath:OUT_PATH,
        emPrefix:"SNPC_EventFrame",
        emOutPath:'CastAI',
        hookOpt:{enableMoveStatus:false}
    });
    await buildSubmod(AIDm);
    await buildOverride(AIDm);
    await buildMonster(AIDm);
    await AIDm.saveAllData();
}