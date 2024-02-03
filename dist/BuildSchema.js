"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdda_schema_1 = require("cdda-schema");
async function main() {
    const builder = new cdda_schema_1.SchemaBuilder();
    builder.covetDefinitionsTable.CastAIDataJson = {
        properties: {
            table: {
                $ref: "#/definitions/CastAIDataTable"
            }
        }
    };
    await builder.builSchema("tsconfig.json", "./schema");
}
main();
