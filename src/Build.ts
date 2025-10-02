import { DataManager } from "@sosarciel-cdda/event";
import { buildCastAI } from "./CastAI";
import { DATA_PATH, OUT_PATH } from "./Define";
import { buildStrengthen } from "./Strengthen";
import { buildCommon } from "./Common";






export async function build(){
    const AIDm = new DataManager(DATA_PATH,OUT_PATH,"CNPCAIEF",{enableMoveStatus:false});
    await buildCommon(AIDm);
    await buildCastAI(AIDm);
    await buildStrengthen(AIDm);
    await AIDm.saveAllData();
}