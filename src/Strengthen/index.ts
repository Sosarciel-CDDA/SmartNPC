import { DataManager } from "@sosarciel-cdda/event";
import { buildQuickBack } from "./QuickBack";
import { buildTacticalTransfer } from "./TacticalTransfer";
import { buildStaticEffect } from "./StaticEffect";
import { buildProtect } from "./Protect";



/**构建强化数据，将指定的战术转移和快速回退相关数据添加到数据管理器中。
 * @param dm - 数据管理器实例，用于添加数据。
 * @returns 无返回值，异步操作完成后数据将被添加。
 */
export async function buildStrengthen(dm:DataManager){
    buildQuickBack(dm);
    buildTacticalTransfer(dm);
    buildStaticEffect(dm);
    buildProtect(dm);
}