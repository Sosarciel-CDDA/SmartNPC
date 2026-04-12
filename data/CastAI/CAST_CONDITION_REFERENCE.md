# SmartNPC 施法条件速查报告

## 概述
SmartNPC的施法AI数据存放在 `data/CastAI/` 目录下，按mod分文件夹存放json5格式数据。
每个文件定义了法术ID到施法条件的映射。

---

## 数据文件格式

```json5
{
    require_mod: "magiclysm",      // 需求mod
    common_condition: { ... },     // 可选，共同条件
    table: {
        // 简写：直接使用条件类型名
        smite: "TargetDamage",
        
        // null 表示不定义施法条件
        recover_mana: null,
        
        // 完整写法：带参数的条件
        animist_summon_decaying_boneclub: {
            type: "BattleSelfBuffCond",
            condition: { not: { u_has_item: "decaying_boneclub" } }
        },
    }
}
```

---

## 施法条件类型速查表

### 一、伤害类条件

| 类型名 | 说明 | Hook | 适用场景 |
|--------|------|------|----------|
| `TargetDamage` | 目标伤害 | TryAttack | 通用伤害法术 |
| `MeleeTargetDamage` | 近战目标伤害 | TryMeleeAttack | 近战触发伤害 |
| `RangeTargetDamage` | 远程目标伤害 | TryRangeAttack | 远程触发伤害 |
| `SelfAoeDamage` | 自身半径AOE伤害 | TryMeleeAttack | 近战AOE法术 |
| `TargetDebuff` | 目标debuff | TryAttack | 施加负面效果 |
| `TargetDebuffCond` | 条件触发的目标debuff | TryAttack | 需要条件的debuff |

**TargetDebuffCond 参数**:
```typescript
{
    type: "TargetDebuffCond",
    condition: BoolExpr  // u为自身，n为目标
}
```

---

### 二、Buff类条件

| 类型名 | 说明 | Hook | 适用场景 |
|--------|------|------|----------|
| `AlawaySelfBuff` | 常态自身buff | BattleUpdate + SlowUpdate | 永久保持的buff |
| `BattleSelfBuff` | 战斗自身buff | BattleUpdate | 仅战斗中保持 |
| `AlawaySelfBuffCond` | 条件触发的常态自身buff | BattleUpdate + SlowUpdate | 需要条件的buff |
| `NonBattleSelfBuffCond` | 条件触发的非战斗自身buff | NonBattleSlowUpdate | 非战斗时的buff |
| `BattleSelfBuffCond` | 条件触发的战斗自身buff | BattleUpdate | 战斗中条件触发 |
| `AlawayTargetBuff` | 常态目标buff | BattleUpdate + SlowUpdate | 给队友的buff |
| `AlawayTargetBuffCond` | 条件触发的常态目标buff | BattleUpdate + SlowUpdate | 条件给队友buff |
| `BattleTargetBuff` | 战斗目标buff | BattleUpdate | 战斗中给队友buff |
| `BattleTargetBuffCond` | 条件触发的战斗目标buff | BattleUpdate | 战斗中条件给队友buff |

**Buff条件参数**:
```typescript
{
    type: "BattleSelfBuffCond",
    condition: BoolExpr,  // u为自身，n为目标(TargetBuff时)
    weight?: number       // 权重，默认1
}
```

---

### 三、召唤/治疗类条件

| 类型名 | 说明 | Hook | 适用场景 |
|--------|------|------|----------|
| `BattleSummonMonster` | 召唤怪物 | BattleUpdate | 战斗中召唤 |
| `TargetHeal` | 目标治疗 | BattleUpdate + SlowUpdate | 治疗队友 |
| `SelfHeal` | 自身治疗 | BattleUpdate + SlowUpdate | 自我治疗 |

---

### 四、特殊条件

| 类型名 | 说明 | 适用场景 |
|--------|------|----------|
| `ControlCast` | 玩家控制施法 | 需要玩家选择目标的法术 |
| `ItemCast` | 物品充能释放 | 消耗物品/充能施法 |
| `Inherit` | 从基础继承 | 复用已有条件并修改 |

**ItemCast 参数**:
```typescript
{
    type: "ItemCast",
    base: "TargetDamage",        // 基于哪种基础类型
    item_id: "mana_crystal",     // 物品ID
    charge?: number,             // 消耗充能，默认1
    consume_item?: boolean,      // 消耗物品而非充能，默认false
    force_lvl?: number           // 强制使用某个法术等级
}
```

**Inherit 参数**:
```typescript
{
    type: "Inherit",
    base: "TargetDamage",        // 从基础继承
    // ...其他CastAIData字段可覆盖
}
```

---

## Hook时机说明

| Hook | 说明 |
|------|------|
| `TryAttack` | 尝试攻击时 |
| `TryMeleeAttack` | 尝试近战攻击时 |
| `TryRangeAttack` | 尝试远程攻击时 |
| `BattleUpdate` | 战斗中更新 |
| `SlowUpdate` | 缓慢更新（常驻检测） |
| `NonBattleSlowUpdate` | 非战斗时缓慢更新 |
| `None` | 无时机（用于control_cast） |

---

## TargetType说明

| Target | 说明 |
|--------|------|
| `auto` | 根据施法目标自动选择 |
| `raw` | 直接调用cast_spell |
| `random` | 随机目标 |
| `direct_hit` | 直接命中交互单位 |
| `filter_random` | 筛选目标随机 |
| `control_cast` | 玩家控制施法 |

---

## 常用条件表达式示例

```typescript
// 没有某物品时
{ not: { u_has_item: "item_id" } }

// 有某效果时
{ u_has_effect: "effect_id" }

// 没有某效果时
{ not: { u_has_effect: "effect_id" } }

// 生命值低于阈值
{ math: ["u_hp('torso')", "<=", "u_hp_max('torso')/3"] }

// 附近有敌对单位
{ math: [JM.monstersNearby('u',[],{radius:"5",attitude:"'hostile'"}),">=","1"] }

// 复合条件
{ and: [
    { not: { u_has_effect: "effect_id" } },
    { math: ["u_hp('torso')", ">", "20"] }
]}
```

---

## 现有文件结构

```
data/CastAI/
├── base/
│   └── BaseSkill.json5          // 基础技能
├── magiclysm/
│   ├── animist.json5            // 泛灵师
│   ├── biomancer.json5          // 生化术士
│   ├── druid.json5              // 德鲁伊
│   ├── earthshaper.json5        // 塑地者
│   ├── kelvinist.json5          // 炽霜法师
│   ├── magus.json5              // 魔术师
│   ├── stormshaper.json5        // 风暴塑造者
│   ├── technomancer.json5       // 科技法师
│   └── other.json5              // 其他
├── mindovermatter/
│   ├── biokinesis.json5         // 炼体者
│   ├── clairsentience.json5     // 灵视者
│   ├── classless.json5          // 无职业
│   ├── electrokinesis.json5     // 驱电者
│   ├── photokinesis.json5       // 控光者
│   ├── pyrokinesis.json5        // 焰动者
│   ├── telekinesis.json5        // 念动者
│   ├── telepathy.json5          // 超感者
│   ├── teleportation.json5      // 传送者
│   └── vitakinesis.json5        // 疗愈者
└── xedra_evolved/
    ├── dreamer.json5            // 梦行者
    └── eater.json5              // 食梦者
```

---

## 待添加文件

根据Schema提取结果，以下mod的法术数据需要添加：

### Magiclysm attunements (调谐职业)
- `magiclysm/attun_alchemist.json5` - 炼金术士
- `magiclysm/attun_artificer.json5` - 工匠
- `magiclysm/attun_biotek.json5` - 生物科技
- ... (共30个职业)

### Xedra_Evolved
- `xedra_evolved/changeling.json5` - 变形者
- `xedra_evolved/classless.json5` - 无职业
- `xedra_evolved/hedge_magic.json5` - 边缘魔法
- `xedra_evolved/inventor.json5` - 发明家
- `xedra_evolved/lilin.json5` - 莉莉姆
- `xedra_evolved/vampire.json5` - 吸血鬼
- `xedra_evolved/race_arvore.json5` - 种族-树精
- `xedra_evolved/race_homullus.json5` - 种族-Homullus
- `xedra_evolved/race_ierde.json5` - 种族-Ierde
- `xedra_evolved/race_paraclesian.json5` - 种族-通用
- `xedra_evolved/race_salamander.json5` - 种族-火元素
- `xedra_evolved/race_sylph.json5` - 种族-风元素
- `xedra_evolved/race_undine.json5` - 种族-水元素
