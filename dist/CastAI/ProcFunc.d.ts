import { JObject } from "@zwa73/utils";
import { Resp, SpeakerEffect } from "cdda-schema";
import { DataManager } from "cdda-event";
import { CastProcData, TargetType } from "./CastAIInterface";
export declare function procSpellTarget(target: TargetType | undefined, dm: DataManager, cpd: CastProcData): Promise<JObject[]>;
/**控制施法所需的效果 */
export declare const ControlCastSpeakerEffects: SpeakerEffect[];
/**控制施法的回复 */
export declare const ControlCastResps: Resp[];
