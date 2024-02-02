import { DataManager } from "cdda-event";
import { createCastAI } from "./CastAI";
import { DATA_PATH, OUT_PATH } from "./SADefine";
import { createMathFunc } from "./MathFunc";






async function main(){
    const AIDm = new DataManager(DATA_PATH,OUT_PATH,"CNPCAIEF");
    await createCastAI(AIDm);
    await createMathFunc(AIDm);
    await AIDm.saveAllData();
}
main();
