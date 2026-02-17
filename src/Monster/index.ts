import { DataManager } from "@sosarciel-cdda/event";
import { buildNpcMonster } from "./Npc";




export const buildMonster = (dm:DataManager)=>{
    return Promise.all([
        buildNpcMonster(dm),
    ])
}