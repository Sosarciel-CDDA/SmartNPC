import { AnyItemID, Effect, SpellID } from "cdda-schema";
import { CastAIData } from "./CastAIInterface";
/**无参预定义的施法数据 列表 */
export declare const NoParamDefCastDataList: readonly ["TargetDamage", "MeleeTargetDamage", "RangeTargetDamage", "BattleSelfBuff", "AlawaySelfBuff", "BattleTargetBuff", "AlawayTargetBuff"];
/**无参预定义的施法数据 */
export type NoParamDefCastData = typeof NoParamDefCastDataList[number];
/**物品充能释放 */
export type ItemCast = {
    type: "ItemCast";
    /**基于哪种基础类型 */
    base: NoParamDefCastData;
    /**物品ID */
    item_id: AnyItemID;
    /**消耗的充能 默认1 */
    charge?: number;
    /**消耗物品而非充能 默认false */
    consume_item?: boolean;
    /**强制使用某个法术等级 默认使用已知等级 */
    force_lvl?: number;
};
/**从基础继承 */
export type Inherit = {
    /**从基础继承 */
    type: "Inherit";
    /**基于哪种基础类型 */
    base: NoParamDefCastData;
} & Partial<CastAIData>;
/**预定义的施法数据 */
export type ObjDefCastData = [
    ItemCast,
    Inherit
][number];
/**预定义的施法数据 */
export type DefCastData = NoParamDefCastData | ObjDefCastData;
/**预定义的施法数据类型 */
export type DefCastDataType = NoParamDefCastData | ObjDefCastData["type"];
export declare const ConcentratedAttack: Effect;
/**根据预定义的ID获得预定义施法数据 */
export declare function getDefCastData(data: DefCastData | CastAIData, spellid: SpellID): CastAIData;
