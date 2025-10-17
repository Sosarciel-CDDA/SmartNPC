import { DataManager } from "@sosarciel-cdda/event";
import { buildXedraOverride } from "./Override";





export const buildOverride = async (dm:DataManager)=>{
    await Promise.all([
        buildXedraOverride(dm),
    ]);
}