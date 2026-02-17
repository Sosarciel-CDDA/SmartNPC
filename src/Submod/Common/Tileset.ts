import { DataManager } from "@sosarciel-cdda/event";




export const buildTileset = async (dm:DataManager)=>{
    //写入基础贴图配置
    await dm.saveToFile("mod_tileset.json", [{
        type: "mod_tileset",
        compatibility: ['gfx_name'],
        "tiles-new": [{
            file: "32xTransparent.png",
            sprite_width: 32,
            sprite_height: 32,
            sprite_offset_x: 0,
            sprite_offset_y: 0,
            pixelscale: 1,
            tiles: [
                //{ id: "npc_female"  , fg: 0, bg: 0 },
                //{ id: "npc_male"    , fg: 0, bg: 0 },
                { id: "TransparentItem", fg: 0, bg: 0 },
            ]
        }],
    }]);
}