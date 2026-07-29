<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/attributecomponent/attributetype -->
<!-- Snapshot date: 2026-07-29 -->

# AttributeType

| 枚举 | 说明 |
| --- | --- |
| AttributeType.ATTACK | 攻击时触发，需要重写 runAttack 方法 |
| AttributeType.DEFENSE | 被攻击者时触发，需要重写 runDefense 方法 |
| AttributeType.UPDATE | 属性更新时触发，需要重写 run 方法 |
| AttributeType.RUNTIME | 每隔多少秒触发一次，需重写 run 方法 |
| AttributeType.KILLER | 击杀目标时触发，需要重写 runKiller 方法 |
| AttributeType.CUSTOM | 自定义属性触发器，需要重写 runCustom 方法 |
| AttributeType.OTHER | 该类型主要为其他类型的属性提供属性值 |

**KILLER** 类型 **JavaScript** 自定义属性脚本示例：[传送门](/docs/attributeplus/kai-fa-wen-dang/api-1#javascript-%E4%B8%AD%E4%BD%BF%E7%94%A8%E8%AE%A1%E6%95%B0%E5%99%A8%E7%A4%BA%E4%BE%8B)
