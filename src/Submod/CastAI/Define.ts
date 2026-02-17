import { UtilFT } from "@zwa73/utils";
import { DATA_PATH, SNDef } from "@/src/Define";
import { CastAIDataJsonTable, CastAIDataTable } from "./Interface";
import path from 'pathe';
import { EocEffect, Resp, SpellID } from "@sosarciel-cdda/schema";
import { getDefCastData } from "./DefineCastCondition";
import { uv } from "./UtilFunc";

//全局冷却字段名
export const CoCooldownName = SNDef.genVarID(`CoCooldown`);

//falback字段名
export const FallbackValName = SNDef.genVarID(`CastFallbackCounter`);

/**总开关 */
export const CoSwitchDisableName = SNDef.genVarID(`CoSwitchDisable`);

/**完成初始化施法设置 */
export const InitedCastSettingName = SNDef.genVarID(`InitedCastSetting`);

/**控制施法所需的前置效果 */
export const ControlCastSpeakerEffects:EocEffect[] = [];

/**控制施法的回复 */
export const ControlCastResps:Resp[]=[];

//载入数据
/**施法AI数据 */
export const CastAIDataMap:CastAIDataTable = {};
const tableList = [
    ...UtilFT.fileSearchGlobSync(DATA_PATH,path.join("CastAI","**","*.json")),
    ...UtilFT.fileSearchGlobSync(DATA_PATH,path.join("CastAI","**","*.json5")),
];

tableList.forEach((file)=>{
    const json = UtilFT.loadJSONFileSync(file,{json5:true,forceExt:true}) as CastAIDataJsonTable;

    Object.entries(json.table).forEach(([spellID,castData])=>{
        if(castData==undefined) return;
        //转换预定义castAiData
        castData = getDefCastData(castData,spellID as SpellID);
        castData!.id = castData!.id??spellID as SpellID;
        CastAIDataMap[spellID as SpellID] = castData;

        //处理辅助条件
        castData.merge_condition = {
            manualSwitch:[{math:[uv(CoSwitchDisableName),"!=","1"]}],
            other:[
                "u_is_npc",
                {math:[uv(CoCooldownName),"<=","0"]},
                ... (json.require_mod!==undefined ? [{mod_is_loaded:json.require_mod}] : []),
                ... (json.common_condition!==undefined ? [json.common_condition] : []),
            ]
        }
        //{and:[
        //    "u_is_npc",
        //    {math:[uv(CoCooldownName),"<=","0"]},
        //    {math:[uv(CoSwitchDisableName),"!=","1"]},
        //    ... (json.require_mod!==undefined ? [{mod_is_loaded:json.require_mod}] : []),
        //    ... (json.common_condition!==undefined ? [json.common_condition] : []),
        //]};
    })
});