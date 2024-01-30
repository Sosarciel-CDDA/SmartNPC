"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdda_event_1 = require("cdda-event");
const CastAI_1 = require("./CastAI");
const SADefine_1 = require("./SADefine");
async function main() {
    const AIDm = new cdda_event_1.DataManager(SADefine_1.DATA_PATH, SADefine_1.OUT_PATH, "CNPCAIEF");
    await (0, CastAI_1.createCastAI)(AIDm);
    await AIDm.saveAllData();
}
main();
