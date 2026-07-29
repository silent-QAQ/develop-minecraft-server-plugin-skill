<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-jiao-ben/ -->
<!-- Snapshot date: 2026-07-29 -->

# 属性脚本

## 前提[​](#前提 "前提的直接链接")

你需要拥有一定的 **JavaScript** 知识，当然没有的话可以看下方教程

## 脚本工具[​](#脚本工具 "脚本工具的直接链接")

配置 [script.yml](/docs/attributeplus/shu-xing-jiao-ben) 默认自带的一些工具占位符

| 占位符 | 说明用法 |
| --- | --- |
| Utils | 可调用插件自带 AttrScriptUtils 方法 |
| AttributeAPI | 可调用插件自带 AttributeAPI 方法 |
| Bukkit | 可调用 [Bukkit](https://bukkit.windit.net/javadoc/org/bukkit/Bukkit.html) 类内方法 |
| EntityType | 可获取 [EntityType](https://bukkit.windit.net/javadoc/org/bukkit/entity/EntityType.html) 内枚举 |
| Arrays | java.util.Arrays |
| 其他插件API | 阅读 script.yml 配置介绍 |

## 编写属性[​](#编写属性 "编写属性的直接链接")

请先查看 [**AttributeComponent**](/docs/attributeplus/kai-fa-wen-dang/attributecomponent) 属性组件，属性脚本内可调里面的所有方法

通过脚本注册的属性也可以在 `attribute.yml` 内修改 `优先级、战斗力、属性名` 等，[我想写属性脚本](/docs/attributeplus/shu-xing-jiao-ben/shou-ba-shou-jiao-ni-xie-shu-xing-jiao-ben)
