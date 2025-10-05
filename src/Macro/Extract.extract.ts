import { awt, zhl } from "@sosarciel-cdda/schema";
import { UtilFT } from "@zwa73/utils";






const extractFn = (idfield:string,...fields:string[])=>async (fp:string)=>{
    const jsonlist = await UtilFT.loadJSONFile(fp) as any[];
    return Promise.all(jsonlist.map(async (v) => {
        const translated = (await Promise.all(
            fields.map(async f => zhl(Array.isArray(v[f]) ? v[f]?.[0] : v[f]))
        ))
        .filter(fd=>typeof fd === 'string' && fd.length>0);
        const cmt = translated.length>0 ? ` // ${translated.join(' ')}` : '';
        return awt`${`"${v[idfield]}"`.padEnd(30)},${cmt}`;
    }));
}