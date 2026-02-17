import { DataManager } from "@sosarciel-cdda/event";
import { buildQuickBack } from "./QuickBack";
import { buildTacticalTransfer } from "./TacticalTransfer";
import { buildStaticEffect } from "./StaticEffect";


//const modinfo:ModInfo = {
//    "type": "MOD_INFO",
//    id:"smartnpc-strengthen",
//    name:"SmartNpc-Strengthen",
//    "authors": ["zwa73"],
//    "maintainers": ["zwa73"],
//    "description": "加强npc",
//    "category": "other",
//    "dependencies": ["dda",CastAIModInfo.id]
//}

/**构建强化数据，将指定的战术转移和快速回退相关数据添加到数据管理器中。
 * @param dm - 数据管理器实例，用于添加数据。
 * @returns 无返回值，异步操作完成后数据将被添加。
 */
export async function buildStrengthen(dm:DataManager){
    //dm.addData([modinfo],'Strength','modinfo.json');
    return Promise.all([
        buildQuickBack(dm),
        buildTacticalTransfer(dm),
        buildStaticEffect(dm),
    ]);
}