import { DataManager } from "@sosarciel-cdda/event";
import { OptionSliderOptionTypeList } from "@sosarciel-cdda/schema";



const nameMap:Record<string,string> = {
    "MONSTER_SPEED"                : "怪物速度"     ,
    "MONSTER_RESILIENCE"           : "怪物耐性"     ,
    "SPAWN_DENSITY"                : "怪物密度"     ,
    "EVOLUTION_INVERSE_MULTIPLIER" : "怪物进化速度" ,
    "ITEM_SPAWNRATE"               : "物品生成倍率" ,
}

const baselist = [0.5,0.75,1,1.25,1.5,2,4,6,10];

/**构建世界生成滑块 */
export async function buildStrengthen(dm:DataManager){
    const Opts = OptionSliderOptionTypeList.filter(v=>
        ["NPC_SPAWNTIME","CITY_SIZE","CITY_SPACING"].includes(v.option)
    ).map(v=>({
        type: "option_slider",
        id: `OPTS_${v.option}`,
        context: "WORLDGEN",
        name: nameMap[v.option],
        default: 2,
        levels: baselist.map((base,i)=>({
            level: i,
            name: `${base*100}% ${nameMap[v.option]}`,
            description: `${base*100}% ${nameMap[v.option]}`,
            options: [ {option: v.option, value: base*(v.type==="int"?100:1)} ]
        }))
    }));
    dm.addData(Opts,'OptionSlider.json');
}
