import { UtilFT } from "@zwa73/utils";
import { AnyCddaJsonList, ModDefine, Spell, SpellID } from "cdda-schema";
import * as path from 'path';

/**mod物品前缀 */
export const MOD_PREFIX = "CAI";

export const SADef = new ModDefine(MOD_PREFIX);

/**默认最大数字 */
export const MAX_NUM = 1000000;


/**用于必定成功的控制法术的flags */
export const CON_SPELL_FLAG = ["SILENT", "NO_HANDS", "NO_LEGS", "NO_FAIL","NO_EXPLOSION_SFX"] as const;

//初始化法术数据
const files = UtilFT.fileSearchGlobSync(process.cwd(),path.join("spell","**","*.json"));
const spellMap:Partial<Record<SpellID,Spell>> = {};
files.forEach((file)=>{
    const jarr = UtilFT.loadJSONFileSync(file)as any as AnyCddaJsonList;
    if(!Array.isArray(jarr)) return;
    jarr.filter((jobj)=>jobj.type=="SPELL")
        .forEach((spell)=>spellMap[(spell as Spell).id]=spell as Spell)
})
/**根据id从 ./spell 目录中寻找法术 */
export function getSpellByID(id?:SpellID){
    if(id===undefined) throw `未找到法术 ${id}`;
    const spell = spellMap[id];
    if(spell==null) throw `未找到法术 ${id}`;

    if((spell as any)['copy-from']!=undefined){
        const base = getSpellByID((spell as any)['copy-from']) as Spell;
        return Object.assign({},base,spell);
    }
    return spell;
}


export const DATA_PATH = path.join(process.cwd(),'data');
export const ENV_PATH = path.join(process.cwd(),'..');
export const GAME_PATH = (UtilFT.loadJSONFileSync(path.join(ENV_PATH,'build_setting.json'))! as any).game_path as string;
export const OUT_PATH = path.join(GAME_PATH,'data','mods','SmartNPC');