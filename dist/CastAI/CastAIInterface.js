"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetTypeList = void 0;
/**技能选择目标类型 列表 */
exports.TargetTypeList = [
    "auto", //自动
    "random", //原版随机
    "direct_hit", //直接命中交互单位 u为角色 n为受害者 hook必须为InteractiveCharEvent
    "filter_random", //筛选目标随机 u为角色 n为受害者 处理时翻转
    "control_cast", //玩家控制施法
];
