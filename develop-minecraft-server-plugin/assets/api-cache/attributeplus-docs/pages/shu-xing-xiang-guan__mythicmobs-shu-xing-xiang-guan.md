<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-xiang-guan/mythicmobs-shu-xing-xiang-guan -->
<!-- Snapshot date: 2026-07-29 -->

# MythicMobs 属性相关

## 为什么我给怪物穿上装备后属性无法生效？[​](#为什么我给怪物穿上装备后属性无法生效 "为什么我给怪物穿上装备后属性无法生效？的直接链接")

这个问题，可能是因为 MythicMobs 版本所导致的，我在开发时也遇到这种问题，插件读取 **MythicMobs 怪物装备** 时，读取到的装备为 **原版装备，也就是没有属性Lore等内容** 所以才无法读取属性。  
  
出现这种情况你可以使用 **AttributePlus** 提供的更方便的方法，在 **MythicMobs 怪物配置** 上增加 **attribute** 或 **Attribute** 的配置项后设置属性即可。

```
SkeletalKnight:  
  Type: WITHER_SKELETON  
  Display: '&aSkeletal Knight'  
  Attribute:   
    - "物理伤害: 10-100"  
    - "物理防御: 10"
```

## 为什么怪物的生命力，生命力恢复属性无法生效？[​](#为什么怪物的生命力生命力恢复属性无法生效 "为什么怪物的生命力，生命力恢复属性无法生效？的直接链接")

是的，小部分属性无法在怪物身上生效，例如 **生命力、移速加成** 这类属性，但绝大部分是支持怪物的。
