import { SchemaBuilder } from "cdda-schema";


export async function buildSchema(){
    const builder = new SchemaBuilder();
    builder.covetDefinitionsTable.CastAIDataJson = {
        properties:{
            table:{
                $ref:"#/definitions/CastAIDataTable"
            }
        }
    }
    await builder.builSchema("tsconfig.json","./schema");
}
