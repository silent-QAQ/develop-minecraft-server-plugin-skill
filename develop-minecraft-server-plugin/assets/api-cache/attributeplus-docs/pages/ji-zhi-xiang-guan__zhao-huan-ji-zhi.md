<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/ji-zhi-xiang-guan/zhao-huan-ji-zhi -->
<!-- Snapshot date: 2026-07-29 -->

# 召唤机制

## 说明[​](#说明 "说明的直接链接")

MythicMobs 插件有个名 **summon** 的技能，该技能可以让释放者召唤出怪物，来一起战斗。  
该机制可以为 **召唤出来的怪物** 增加 **释放者身上某些属性(可自定义)**

这边就不细讲了，你对 MythicMobs 足够了解自然就懂了 ~~(因为我不太懂)~~

## 机制属性[​](#机制属性 "机制属性的直接链接")

| 属性 | 说明 |
| --- | --- |
| 召唤强度 | 召唤者所召唤怪物的属性继承强度 |

## 机制配置[​](#机制配置 "机制配置的直接链接")

```
#MythicMobs 测试版本 4.7.2  
#MythicMobs 召唤继承  
#召唤的怪物会继承召唤者的某些属性  
summon:  
  enable: false  
  #可继承的怪物名字必须包含以下内容  
  string: "[召唤]"  
  #可继承的属性,不在列表内的属性不继承  
  attribute:  
    - "物理伤害"
```
