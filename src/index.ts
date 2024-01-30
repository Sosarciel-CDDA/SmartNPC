import { DataManager } from "cdda-event";
import { createCastAI } from "./CastAI";
import { DATA_PATH, OUT_PATH } from "./SADefine";






async function main(){
    const AIDm = new DataManager(DATA_PATH,OUT_PATH,"CNPCAIEF");
    await createCastAI(AIDm);
    await AIDm.saveAllData();
}
main();
