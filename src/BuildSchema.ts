import { SchemaBuilder } from "cdda-schema";


async function main(){
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
main()
