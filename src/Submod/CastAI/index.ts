import { DataManager } from '@sosarciel-cdda/event';
import { createCastAITalkTopic } from './TalkTopic';
import { buildSkill } from './CastAI';
import { CommonModinfo } from '../Common';
import { ModInfo } from '@sosarciel-cdda/schema';
import { buildOverride } from '@/src/Override';

export * from './CastAI';
export * from './Interface';
export * from './DefineCastCondition';


export const CastAIModInfo:ModInfo = {
    "type": "MOD_INFO",
    id:"smartnpc-castai",
    name:"SmartNpc-CastAI",
    "authors": ["zwa73"],
    "maintainers": ["zwa73"],
    "description": "SmartNpc的施法AI",
    "category": "other",
    "dependencies": ["dda",CommonModinfo.id]
}

export const buildCastAI = async (dm:DataManager)=>{
    dm.addData([CastAIModInfo],"CastAI",'modinfo');
    await buildSkill(dm);
    //创建对话
    await createCastAITalkTopic(dm);
    await buildOverride(dm,"CastAI");
}