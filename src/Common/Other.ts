import { MagicType } from "@sosarciel-cdda/schema";
import { SNDef } from "../Define";
import { DataManager } from "@sosarciel-cdda/event";



/**控制法术类型 */
export const CONTROL_MAGIC_TYPE_ID = SNDef.genMagicTypeID("Control");

/**控制法术类型 */
const ControlMagicType: MagicType = {
    id: CONTROL_MAGIC_TYPE_ID,
    type: "magic_type",
    energy_source: "MANA",
    cannot_cast_flags: "NO_SPELLCASTING",
    cannot_cast_message: "当前无法释放控制法术",
};

export async function createUtilMagicType(dm:DataManager){
    dm.addData([
        ControlMagicType,
    ],"Common","MagicType");
}