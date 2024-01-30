"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utilSpell = exports.SPELL_M1T = exports.SPELL_CT_MODMOVE = exports.SPELL_CT_MODMOVE_VAR = void 0;
const SADefine_1 = require("./SADefine");
/**施法后摇变量 */
exports.SPELL_CT_MODMOVE_VAR = 'casttime_modmove';
/**施法后摇法术ID */
exports.SPELL_CT_MODMOVE = SADefine_1.SADef.genSpellID(`CastTimeModMove`);
/**加速一回合 */
exports.SPELL_M1T = SADefine_1.SADef.genSpellID("Mod1Turn");
async function utilSpell(dm) {
    const out = [];
    const spellCT = {
        id: exports.SPELL_CT_MODMOVE,
        type: "SPELL",
        name: "施法后摇",
        description: "施法后摇",
        effect: "mod_moves",
        shape: "blast",
        valid_targets: ["self"],
        flags: [...SADefine_1.CON_SPELL_FLAG],
        min_damage: { math: [`0-${exports.SPELL_CT_MODMOVE_VAR}`] },
        max_damage: SADefine_1.MAX_NUM,
    };
    out.push(spellCT);
    const mod1Turn = {
        id: exports.SPELL_M1T,
        type: "SPELL",
        name: "加速一回合",
        description: "获得一回合移动调整",
        effect: "mod_moves",
        shape: "blast",
        valid_targets: ["self"],
        flags: [...SADefine_1.CON_SPELL_FLAG],
        min_damage: 100,
        max_damage: 100
    };
    out.push(mod1Turn);
    dm.addStaticData(out, "UtilSpell");
}
exports.utilSpell = utilSpell;
