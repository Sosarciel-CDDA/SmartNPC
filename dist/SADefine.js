"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OUT_PATH = exports.GAME_PATH = exports.ENV_PATH = exports.DATA_PATH = exports.getSpellByID = exports.CON_SPELL_FLAG = exports.MAX_NUM = exports.SADef = exports.MOD_PREFIX = void 0;
const utils_1 = require("@zwa73/utils");
const cdda_schema_1 = require("cdda-schema");
const path = require("path");
/**mod物品前缀 */
exports.MOD_PREFIX = "CAI";
exports.SADef = new cdda_schema_1.ModDefine(exports.MOD_PREFIX);
/**默认最大数字 */
exports.MAX_NUM = 1000000;
/**用于必定成功的控制法术的flags */
exports.CON_SPELL_FLAG = ["SILENT", "NO_HANDS", "NO_LEGS", "NO_FAIL", "NO_EXPLOSION_SFX"];
//初始化法术数据
const files = utils_1.UtilFT.fileSearchGlob(path.join(process.cwd(), "spell", "**", "*.json"));
const spellMap = {};
files.forEach((file) => {
    const jarr = utils_1.UtilFT.loadJSONFileSync(file);
    if (!Array.isArray(jarr))
        return;
    jarr.filter((jobj) => jobj.type == "SPELL")
        .forEach((spell) => spellMap[spell.id] = spell);
});
/**根据id从 ./spell 目录中寻找法术 */
function getSpellByID(id) {
    if (id === undefined)
        throw `未找到法术 ${id}`;
    const spell = spellMap[id];
    if (spell == null)
        throw `未找到法术 ${id}`;
    return spell;
}
exports.getSpellByID = getSpellByID;
exports.DATA_PATH = path.join(process.cwd(), 'data');
exports.ENV_PATH = path.join(process.cwd(), '..');
exports.GAME_PATH = utils_1.UtilFT.loadJSONFileSync(path.join(exports.ENV_PATH, 'build_setting.json')).game_path;
exports.OUT_PATH = path.join(exports.GAME_PATH, 'data', 'mods', 'CnpcAI');
