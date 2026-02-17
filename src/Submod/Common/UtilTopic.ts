import { TalkTopic } from "@sosarciel-cdda/schema";
import { CombatRuleTopicID } from "../../Define";
import { DataManager } from "@sosarciel-cdda/event";

//战斗对话
const CombatRuleTalkTopic:TalkTopic={
    type:"talk_topic",
    id:CombatRuleTopicID,
    insert_before_standard_exits:true,
    dynamic_line:"&<mypronoun>应该做些什么？",
    responses:[{ text: "Never mind.", topic: "TALK_DONE" }]
}

export async function createUtilTalkTopic(dm:DataManager){
    dm.addData([
        CombatRuleTalkTopic
    ],"Common","TalkTopic");
}
