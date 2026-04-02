import { DataManager } from "@sosarciel-cdda/event";
import { buildXedraInteraction } from "./xedra_evolved";
import { buildMomInteraction } from "./mindovermatter";





export const buildInteraction = async (dm:DataManager,...outapth:string[])=>{
    await Promise.all([
        buildXedraInteraction(dm,...outapth),
        buildMomInteraction(dm,...outapth),
    ]);
}