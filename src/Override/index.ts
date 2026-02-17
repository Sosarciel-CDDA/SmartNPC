import { DataManager } from "@sosarciel-cdda/event";
import { buildXedraOverride } from "./xedra_evolved";
import { buildMomOverride } from "./mindovermatter";





export const buildOverride = async (dm:DataManager,...outapth:string[])=>{
    await Promise.all([
        buildXedraOverride(dm,...outapth),
        buildMomOverride(dm,...outapth),
    ]);
}