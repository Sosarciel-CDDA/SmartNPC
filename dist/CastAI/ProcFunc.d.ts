import { JObject } from "@zwa73/utils";
import { DataManager } from "cdda-event";
import { CastProcData, TargetType } from "./CastAIInterface";
export declare function procSpellTarget(target: TargetType | undefined, dm: DataManager, cpd: CastProcData): Promise<JObject[]>;
