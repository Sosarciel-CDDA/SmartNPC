# 任务: CastAI法术条件分析

## 状态概览
- **启动时间**: 2026-04-12
- **最后更新**: 2026-04-12
- **当前阶段**: 阶段1-3完成，准备开始阶段4

## 重要注意事项 (每次必读)

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

### 阶段 4: magiclysm/animist.json5 (约18条null)
| 编号 | 法术ID | 状态 | 分析结果 |
|---|--------|--------|---------|
| 4.1 | recover_mana | [ ] | - |
| 4.2 | recover_pain | [ ] | - |
| 4.3 | necrotic_gaze | [ ] | - |
| 4.4 | create_rune_animist | [ ] | - |
| 4.5 | life_detonation_explosion | [ ] | - |
| 4.6 | convert | [ ] | - |
| 4.7 | soulrend | [ ] | - |
| 4.8 | spirit_walk | [ ] | - |
| 4.9 | devour | [ ] | - |
| 4.10 | animist_sense_outsiders | [ ] | - |
| 4.11 | animist_summon_watcher | [ ] | - |
| 4.12 | animist_mass_hiding_aoe | [ ] | - |
| 4.13 | animist_luck_bone | [ ] | - |
| 4.14 | animist_spirit_walking | [ ] | - |
| 4.15 | animist_add_evasion_spell | [ ] | - |
| 4.16 | animist_slow_food_rotting_spell | [ ] | - |
| 4.17 | animist_cast_spells_when_silent | [ ] | - |
| 4.18 | animist_detect_wizards | [ ] | - |

### 阶段 5: xedra_evolved/dreamer.json5 (约15条null)
| 编号 | 法术ID | 状态 | 分析结果 |
|---|--------|--------|---------|
| 5.1 | create_dream_dross | [ ] | - |
| 5.2 | banish_nether_monsters | [ ] | - |
| 5.3 | banish_dark_monsters | [ ] | - |
| 5.4 | spell_dreamer_clairvoyance | [ ] | - |
| 5.5 | spell_dreamer_clairvoyance_eff | [ ] | - |
| 5.6 | make_constructed_hammer | [ ] | - |
| 5.7 | xedra_dreamer_time_bubble | [ ] | - |
| 5.8 | teleport_coin | [ ] | - |
| 5.9 | summon_winch | [ ] | - |
| 5.10 | summon_winch_item | [ ] | - |
| 5.11 | dreamer_artifact | [ ] | - |
| 5.12 | xedra_dreamer_generate_accelerated_time | [ ] | - |
| 5.13 | spell_clairvoyance | [ ] | - |
| 5.14 | xedra_eater_stabilize_reality | [ ] | - |
| 5.15 | xedra_eater_erosion | [ ] | - |
| 5.16 | point_blank | [ ] | - |

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

## 断点恢复
- **最后完成任务**: 阶段3全部完成 (3.1-3.30)
- **下一步操作**: 开始处理阶段4 magiclysm/animist.json5
- **搜索命令**: Grep搜索 `"id": "recover_mana"` 定位行号，然后Read读取该行+20行
