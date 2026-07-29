<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/ -->
<!-- Snapshot date: 2026-07-29 -->

# 开发文档

## 前提[​](#前提 "前提的直接链接")

你需要掌握 Java、Kotlin 其中一门编程语言  
你必须拥有开发 Bukkit 插件的能力

有什么不懂的可以加 **901796907** 交流群问

## 事件[​](#事件 "事件的直接链接")

| 事件名 | 说明 |
| --- | --- |
| AttrAttributeTriggerEvent.Before | 属性触发前 |
| AttrAttributeTriggerEvent.After | 属性触发后 |
| AttrUpdateAttributeEvent.Before | 实体属性刷新前 |
| AttrUpdateAttributeEvent.After | 实体属性刷新后 |
| AttrAttributeReadEvent | 属性读取事件 |
| AttrEntityAttackEvent | 实体攻击事件 |
| AttrShieldBlockEvent | 盾牌格挡事件 |
| AttrShootBowEvent | 弓射击事件 |

## 组件[​](#组件 "组件的直接链接")

| 接口名 | 说明 |
| --- | --- |
| [AttributeComponent](/docs/attributeplus/kai-fa-wen-dang/attributecomponent) | 属性组件 |
| ReadComponent | 读取组件 |

## 注释[​](#注释 "注释的直接链接")

| 注释名 | 说明 |
| --- | --- |
| @AutoRegister | 自动注册组件 |
| @AutoIncreaseKey | 自动新增标签 (ReadComponent 会介绍) |
