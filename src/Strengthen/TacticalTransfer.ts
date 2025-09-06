import { Spell } from "@sosarciel-cdda/schema";
import { CON_SPELL_FLAG } from "../SADefine";
import { DataManager } from "@sosarciel-cdda/event";

/**战术转移 */
const TacticalTransfer: Spell = {
    type: "SPELL",
    id: "tactical_transfer",
    description: "传送到视野范围内的另一个位置。",
    name: "战术转移",
    valid_targets: ["ground"],
    effect: "effect_on_condition",
    min_range: 30,
    shape: "blast",
    flags: [...CON_SPELL_FLAG],
    effect_str:"tactical_transfer_eoc",
};
const TacticalTransferEoc = {
    type: "effect_on_condition",
    id: "tactical_transfer_eoc",
    eoc_type: "ACTIVATION",
    effect: [
        {npc_teleport: {global_val: "tactical_transfer_control_cast_loc",}}
    ],
};

export function buildTacticalTransfer(dm:DataManager) {
    dm.addData([
        TacticalTransfer,TacticalTransferEoc
    ],'Strength','TacticalTransfer.json');
}
