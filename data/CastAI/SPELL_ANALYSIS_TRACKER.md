# 任务: CastAI法术条件分析

## 状态概览
- **启动时间**: 2026-04-12
- **最后更新**: 2026-04-12
- **当前阶段**: 全部完成 ✅

## 重要注意事项 (每次必读)

### 0. ⚠️ 关键纪律 (犯错教训 2026-04-13)
- **绝对不能覆盖/修改原有注释内容** — 只在原有注释下方新增 `// 分析: ...` 行
- **绝对不能删除/替换已有的施法时机值** — 只处理 `null` 的法术条目
- **已有值的法术条目完全不要触碰** — 包括注释和值都保持原样
- 之前的错误：重写了animist.json5时覆盖了原有中文注释，并将已有值（如"TargetDamage"等）替换为null

### 1. 分析规则
- attack + 无effect_str + 正数伤害 → TargetDamage
- 无range + 有aoe + 正数伤害 → SelfAoeDamage
- attack + 有effect_str → TargetDebuff (需标注疑虑)
- attack + 无伤害 + 目标含self/ally + duration>8640000(1天) → AlawaySelfBuff
- attack + 无伤害 + 目标含self/ally + duration<8640000(1天) → BattleSelfBuff
- 有range → Self变Target (如AlawayTargetBuff)
- effect_on_condition → 暂不处理，标注复杂
- **注意**: duration单位是1/100秒，1天=8640000

### 2. 搜索策略 (关键!)
```
步骤1: 用Grep搜索法术ID定位定义点
  - pattern: "id": "法术ID"
  - path: 游戏目录/data/mods/对应mod
  - 获取文件路径和行号

步骤2: 仅读取定义点到定义点+20行
  - offset = 定义点行号
  - limit = 20
  - 避免读取整个文件

步骤3: 分析这20行内的关键字段
  - effect, damage, aoe, range, valid_targets, duration, effect_str
```

### 3. 输出格式
- 在原注释下换行写分析注释
- 格式: `// 分析: [判断依据] → [类型]`
- 重点在于思考过程，非完成

### 4. 游戏目录
`h:\CDDA\newver11\cdda-windows-with-graphics-and-sounds-x64-2025-12-01-0424`

---

## 任务列表

### 阶段 1: magiclysm/attunements.json5 (75条) ✅ 完成
| 编号 | 法术ID | 状态 | 分析结果 |
|---|--------|--------|---------|
| 1.1-1.74 | (全部完成) | [x] | 见上方文件 |

### 阶段 2: xedra_evolved/classless.json5 (15条) ✅ 完成
| 编号 | 法术ID | 状态 | 分析结果 |
|---|--------|--------|---------|
| 2.1 | night_sight | [x] | AlawaySelfBuff |
| 2.2 | dread_weight | [x] | TargetDebuff |
| 2.3 | blur | [x] | 特殊:生成物品 |
| 2.4 | damage_transfer | [x] | TargetDamage |
| 2.5 | damage_transfer_heal | [x] | 特殊:内部法术 |
| 2.6 | fire_teleport | [x] | 特殊:传送法术 |
| 2.7 | fire_teleport_explosion | [x] | 特殊:内部法术 |
| 2.8 | call_daffodil | [x] | 特殊:EOC暂不处理 |
| 2.9 | call_daffodil_real | [x] | BattleSummonMonster |
| 2.10 | boann_retaliation_mark | [x] | 特殊:内部法术 |
| 2.11 | boann_retaliation | [x] | 特殊:内部法术 |
| 2.12 | boann_heal | [x] | 特殊:内部法术 |
| 2.13 | boann_banish_monsters_check | [x] | 特殊:内部法术 |
| 2.14 | boann_banish_monsters | [x] | 特殊:内部法术 |
| 2.15 | xedra_self_banish | [x] | 特殊:自杀法术 |

### 阶段 3: magiclysm/other.json5 (30条) ✅ 完成
| 编号 | 法术ID | 状态 | 分析结果 |
|---|--------|--------|---------|
| 3.1 | crystallize_mana | [x] | 特殊:EOC暂不处理 |
| 3.2 | crystallize_mana_1 | [x] | 特殊:生成物品 |
| 3.3 | crystallize_mana_crystal_5 | [x] | 特殊:生成物品 |
| 3.4 | mana_fatigue | [x] | 特殊:内部法术 |
| 3.5 | dark_sight | [x] | AlawaySelfBuff |
| 3.6 | megablast | [x] | TargetDamage |
| 3.7 | create_atomic_light | [x] | 特殊:生成物品 |
| 3.8 | blinding_flash | [x] | TargetDebuff |
| 3.9 | ethereal_grasp | [x] | 特殊:EOC暂不处理 |
| 3.10 | protection_aura | [x] | 特殊:生成物品 |
| 3.11 | protection_aura_plus | [x] | 特殊:生成物品 |
| 3.12 | translocate_self | [x] | 特殊:传送法术 |
| 3.13 | acid_resistance | [x] | AlawaySelfBuff |
| 3.14 | acid_resistance_greater | [x] | AlawaySelfBuff |
| 3.15 | thought_shield | [x] | 特殊:生成物品 |
| 3.16 | thought_shield_plus | [x] | 特殊:生成物品 |
| 3.17 | sound_bomb | [x] | TargetDamage |
| 3.18 | classless_watch_spell | [x] | AlawaySelfBuff |
| 3.19 | classless_clean_clothing_and_self | [x] | 特殊:EOC暂不处理 |
| 3.20 | classless_easy_sleep_spell | [x] | AlawaySelfBuff |
| 3.21 | classless_dispel_magic | [x] | TargetDebuff |
| 3.22 | classless_disjunction | [x] | TargetDebuff |
| 3.23 | classless_restore_crystal_mana | [x] | 特殊:恢复魔力 |
| 3.24-3.30 | eoc_*_setup | [x] | 特殊:内部法术 |

### 阶段 4: magiclysm/animist.json5 (约18条null) ✅ 完成
> ⚠️ 之前完成时犯了严重错误：覆盖原有注释+删除已有值，已回退重做
> ✅ 2026-04-13 重新完成：仅添加分析注释+修改null值，保留所有原有内容
| 编号 | 法术ID | 状态 | 分析结果 |
|---|--------|--------|---------|
| 4.1 | recover_mana | [x] | 特殊: 恢复魔力，null |
| 4.2 | recover_pain | [x] | 特殊: 恢复痛觉，null |
| 4.3 | necrotic_gaze | [x] | TargetDamage |
| 4.4 | create_rune_animist | [x] | 特殊: 生成物品，null |
| 4.5 | life_detonation_explosion | [x] | 特殊: 内部法术，null |
| 4.6 | convert | [x] | 特殊: 杀盟友生符文，null |
| 4.7 | soulrend | [x] | 特殊: 变形法术，null |
| 4.8 | spirit_walk | [x] | 特殊: 传送法术，null |
| 4.9 | devour | [x] | 特殊: 吞噬恢复，null |
| 4.10 | animist_sense_outsiders | [x] | BattleSelfBuff |
| 4.11 | animist_summon_watcher | [x] | BattleSummonMonster |
| 4.12 | animist_mass_hiding_aoe | [x] | TargetDebuff (AoE隐身) |
| 4.13 | animist_luck_bone | [x] | 特殊: 生成物品，null |
| 4.14 | animist_spirit_walking | [x] | 特殊: EOC，null |
| 4.15 | animist_add_evasion_spell | [x] | BattleSelfBuff |
| 4.16 | animist_slow_food_rotting_spell | [x] | 特殊: EOC，null |
| 4.17 | animist_cast_spells_when_silent | [x] | BattleSelfBuff |
| 4.18 | animist_detect_wizards | [x] | BattleSelfBuff |

### 阶段 5: xedra_evolved/dreamer.json5 (约13条null) ✅ 完成
| 编号 | 法术ID | 状态 | 分析结果 |
|---|--------|--------|---------|
| 5.1 | create_dream_dross | [x] | 特殊: 生成物品，null |
| 5.2 | banish_nether_monsters | [x] | TargetDamage |
| 5.3 | banish_dark_monsters | [x] | 特殊: 放逐法术，null |
| 5.4 | spell_dreamer_clairvoyance | [x] | 特殊: 透视法术，null |
| 5.5 | spell_dreamer_clairvoyance_eff | [x] | 特殊: 透视场(内部)，null |
| 5.6 | make_constructed_hammer | [x] | 特殊: 生成物品，null |
| 5.7 | xedra_dreamer_time_bubble | [x] | 特殊: 时间冻结控制，null |
| 5.8 | teleport_coin | [x] | 特殊: 传送法术，null |
| 5.9 | summon_winch | [x] | 特殊: EOC，null |
| 5.10 | summon_winch_item | [x] | 特殊: 生成物品(内部)，null |
| 5.11 | dreamer_artifact | [x] | 特殊: EOC，null |
| 5.12 | xedra_dreamer_generate_accelerated_time | [x] | 特殊: EOC，null |
| 5.13 | dreamer_lucid_dreams | [x] | 特殊: EOC，null |

## 会话日志
| 时间 | 操作 | 结果 |
|------|--------|------|
| 2026-04-12 | 创建追踪文件 | 开始任务 |
| 2026-04-12 | 修正搜索策略 | 采用Grep定位+行号读取 |
| 2026-04-12 | 修正duration单位 | 1天=8640000 (1/100秒) |
| 2026-04-12 | 批量更新追踪 | 1.1-1.57标记完成 |
| 2026-04-12 | 完成阶段1 | 1.58-1.74标记完成，阶段1全部完成 |
| 2026-04-12 | 完成阶段2 | 2.1-2.15标记完成，阶段2全部完成 |
| 2026-04-12 | 完成阶段3 | 3.1-3.30标记完成，阶段3全部完成 |
| 2026-04-13 | 阶段4错误 | 覆盖原有注释+删除已有值，已回退，重新开始 |
| 2026-04-13 | 阶段4重做完成 | 4.1-4.18全部完成，7个填入类型，11个保留null |
| 2026-04-13 | 阶段5完成 | 5.1-5.13全部完成，1个填入类型，12个保留null |

## 断点恢复
- **最后完成任务**: 阶段5全部完成 (5.1-5.13)
- **下一步操作**: 所有阶段已完成，任务结束
- **搜索命令**: N/A
