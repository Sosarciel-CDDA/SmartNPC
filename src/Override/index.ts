import { DataManager } from "@sosarciel-cdda/event";
import { buildXedraOverride } from "./xedra_evolved";
import { buildMomOverride } from "./mindovermatter";





export const buildOverride = async (dm:DataManager)=>{
    await Promise.all([
        buildXedraOverride(dm),
        buildMomOverride(dm),
    ]);
}