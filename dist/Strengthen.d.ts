import { DataManager } from "cdda-event";
/**用于必定成功的控制法术的flags */
export declare const CON_SPELL_FLAG: readonly ["SILENT", "NO_HANDS", "NO_LEGS", "NO_FAIL", "NO_EXPLOSION_SFX"];
/**构建强化数据，将指定的战术转移和快速回退相关数据添加到数据管理器中。
 * @param dm - 数据管理器实例，用于添加数据。
 * @returns 无返回值，异步操作完成后数据将被添加。
 */
export declare function buildStrengthen(dm: DataManager): Promise<void>;
