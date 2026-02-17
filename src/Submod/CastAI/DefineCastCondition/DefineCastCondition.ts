import { SpellID } from "@sosarciel-cdda/schema";
import { CastAIData } from "@/src/Submod/CastAI/Interface";
import { getSpellByID } from "@/src/Define";
import { CastCondDataTable, CastCondFuncTable } from "./Define";





/**预定义的施法数据 */
export type DefCastData = CastCondDataTable[keyof CastCondDataTable];
/**预定义的施法数据类型 */
export type DefCastDataType = keyof CastCondDataTable;

/**根据预定义的ID获得预定义施法数据 */
export function getDefCastData(data:DefCastData|CastAIData,spellid:SpellID):CastAIData{
    const dtype=
        (typeof data === "object" && "type" in data) ? data.type :
        (typeof data === "string") ? data : undefined;

    if(dtype==undefined) return data as any;

    const gener = (CastCondFuncTable)[dtype as keyof typeof CastCondFuncTable] as any;
    return gener(data,getSpellByID(spellid));
}