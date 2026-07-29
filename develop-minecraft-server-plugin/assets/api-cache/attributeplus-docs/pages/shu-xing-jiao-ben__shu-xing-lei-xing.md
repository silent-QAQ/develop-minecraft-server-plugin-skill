<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-jiao-ben/shu-xing-lei-xing -->
<!-- Snapshot date: 2026-07-29 -->

# 属性类型

## 介绍[​](#介绍 "介绍的直接链接")

AttributePlus 属性由 `ATTACK DEFENSE RUNTIME UPDATE OTHER` 五个类型组成

使用属性脚本编写时，需要编写不同方法名内的逻辑作为属性执行逻辑

|  |  |
| --- | --- |
| ATTACK | function runAttack(attr, attacker, entity, ha...) |
| DEFENSE | function runDefense(attr, entity, killer, handle) |
| KILLER | function runKiller(attr, killer, entity, handle) |
| UPDATE | function run(attr, entity, handle) |
| RUNTIME | function run(attr, entity, handle) |
| OTHER | 无需编写 |

可以查看 [脚本教学](/docs/attributeplus/shu-xing-jiao-ben/shou-ba-shou-jiao-ni-xie-shu-xing-jiao-ben/) 页面内的属性示例

**KILLER** 类型 **JavaScript** 自定义属性脚本示例：传送门
