import { UtilFT } from "@zwa73/utils";
import { AnyCddaJsonList, GAME_MOD_DIR, MagicType, MagicTypeID, ModDefine, Spell, SpellID } from "@sosarciel-cdda/schema";
import path from 'pathe';

/**mod物品前缀 */
export const MOD_PREFIX = "SNPC";

export const SNDef = new ModDefine(MOD_PREFIX);

/**默认最大数字 */
export const MAX_NUM = 1000000;


//初始化法术数据
const files = UtilFT.fileSearchGlobSync(process.cwd(),path.join("data","Spell","**","*.json"));
const spellMap:Partial<Record<SpellID,Spell>> = {};
const spellTypeMap:Partial<Record<MagicTypeID,MagicType>> = {};
files.forEach((file)=>{
    const jarr = UtilFT.loadJSONFileSync(file)as any as AnyCddaJsonList;
    if(!Array.isArray(jarr)) return;
    jarr.forEach(obj=>{
        if(obj.type=="SPELL"){
            spellMap[(obj as Spell).id]=obj as Spell
        }else if(obj.type=="magic_type"){
            spellTypeMap[(obj as MagicType).id]=obj as MagicType
        }
    })
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
    spell.name = (typeof spell.name == 'string' ? spell.name : spell.name.str??spell.name.str_sp??spell.name.str_pl??spell.name.ctxt) as string;
    if(spell.magic_type!=undefined && spell.energy_source==undefined)
        spell.energy_source = spellTypeMap[spell.magic_type]?.energy_source;

    return spell;
}

export const DATA_PATH = path.join(process.cwd(),'data');
export const ENV_PATH = path.join(process.cwd(),'..');
export const OUT_PATH = path.join(GAME_MOD_DIR,'SmartNPC');

/**用于必定成功的控制法术的flags */
export const CON_SPELL_FLAG = [
    "SILENT",
    "NO_HANDS",
    "NO_LEGS",
    "NO_FAIL",
    "NO_EXPLOSION_SFX",
] as const;

// 战斗规则对话ID
export const CombatRuleTopicID = SNDef.genTalkTopicID(`CombatRule`);