<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/du-qu-xiang-guan/nbt-shu-xing-jia-zai -->
<!-- Snapshot date: 2026-07-29 -->

# NBT属性加载

## 介绍[​](#介绍 "介绍的直接链接")

支持加载指定 **NBT** 列表内的属性数据，可同时判断物品上多个 **NBT** 节点内的属性

该功能从 **3.3.0.6** 插件版本开始支持

## 使用说明[​](#使用说明 "使用说明的直接链接")

NBT 属性加载节点列表配置位于 attribute.yml 内，具体位置如下

```
setting:  
  #属性NBT节点列表  
  attribute-nbt-list:  
    - "attribute_tag"
```

以上面配置例子 + **MythicMobs** 物品为例

```
test_item:  
  Id: 276  
  NBT:  
    attribute_tag:  
      "物理伤害": "100"  
      "生命力": "10(%)"  
  
test_item_2:  
  Id: 276  
  NBT:  
    attribute_tag:  
      "物理伤害": 100
```

部分插件支持设置 NBT 数据为 List 类型，但 **MythicMobs** 没办法

```
#这是一个错误的示例，因为 MythicMobs 的NBT设置格式不支持这种  
#但有一些NBT编辑插件支持，所以不支持的情况下就用上面的方式  
test_item_3:  
  Id: 276  
  NBT:  
    attribute_tag:  
      - "物理伤害: 100"
```
