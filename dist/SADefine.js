"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OUT_PATH = exports.GAME_PATH = exports.ENV_PATH = exports.DATA_PATH = exports.CON_SPELL_FLAG = exports.MAX_NUM = exports.SADef = exports.MOD_PREFIX = void 0;
exports.getSpellByID = getSpellByID;
const utils_1 = require("@zwa73/utils");
const cdda_schema_1 = require("cdda-schema");
const path = __importStar(require("path"));
/**mod物品前缀 */
exports.MOD_PREFIX = "CAI";
exports.SADef = new cdda_schema_1.ModDefine(exports.MOD_PREFIX);
/**默认最大数字 */
exports.MAX_NUM = 1000000;
/**用于必定成功的控制法术的flags */
exports.CON_SPELL_FLAG = ["SILENT", "NO_HANDS", "NO_LEGS", "NO_FAIL", "NO_EXPLOSION_SFX"];
//初始化法术数据
const files = utils_1.UtilFT.fileSearchGlobSync(process.cwd(), path.join("spell", "**", "*.json"));
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
    if (spell['copy-from'] != undefined) {
        const base = getSpellByID(spell['copy-from']);
        return Object.assign({}, base, spell);
    }
    return spell;
}
exports.DATA_PATH = path.join(process.cwd(), 'data');
exports.ENV_PATH = path.join(process.cwd(), '..');
exports.GAME_PATH = utils_1.UtilFT.loadJSONFileSync(path.join(exports.ENV_PATH, 'build_setting.json')).game_path;
exports.OUT_PATH = path.join(exports.GAME_PATH, 'data', 'mods', 'SmartNPC');
