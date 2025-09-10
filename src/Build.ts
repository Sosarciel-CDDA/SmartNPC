import { DataManager } from "@sosarciel-cdda/event";
import { createCastAI } from "./CastAI";
import { DATA_PATH, OUT_PATH } from "./Define";
import { createMathFunc } from "./MathFunc";
import { createUtilSpell } from "./UtilSpell";
import { buildStrengthen } from "./Strengthen";






export async function build(){
    const AIDm = new DataManager(DATA_PATH,OUT_PATH,"CNPCAIEF",{enableMoveStatus:false});
    await createUtilSpell(AIDm);
    await createCastAI(AIDm);
    await createMathFunc(AIDm);
    await buildStrengthen(AIDm);
    await AIDm.saveAllData();
}