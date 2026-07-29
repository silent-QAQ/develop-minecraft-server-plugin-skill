<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/du-qu-xiang-guan/zi-ding-yi-tiao-jian-biao-qian -->
<!-- Snapshot date: 2026-07-29 -->

# 自定义条件标签

## 介绍[​](#介绍 "介绍的直接链接")

从 3.3.0.8 版本起，你可以通过配置自定义多种不同的条件标签，如 **"战力要求"、"生命要求"** 等一系列

新的条件标签，支持自定义读取格式、标签名、处理方式，处理方式采用 **Kether** 语法。

配置位置位于 **format.yml -> custom-condition-component** 配置项

## 配置[​](#配置 "配置的直接链接")

```
#自定义规则标签  
custom-condition-component:  
  example:  
    #添加至物品的标签  
    key: "战力要求"  
    #读取格式  
    formats:  
      - "{key}.*?@value"  
    #{value_0-N} 代表获取到的值(未处理过的数据)  
    #{value_min_0-N} 表示获取到的最小值  
    #{value_max_0-N} 表示获取到的最大值,如果非范围值格式则返回 none  
    #{..._0-N} 0-N 每个对应上方 formats 配置的 @value 或 (.*?)  
    conditions:  
      - check '%ap_combatPower%' >= {value_min_0}  
      - any [ check '{value_max_0}' == 'none' check '%ap_combatPower%' <= {value_max_0} ]  
    #不满足时的提示  
    message: "&f你不满足 &6{item_name} &f物品的使用战力要求"  
  
#如果 custom-condition-component 配置项内,使用 AttributePlus 自带的变量时,需将变量配置进来  
cache-placeholder:  
  #- "attack"  
  - "combatPower"
```

配置内自带了一个新的条件标签，即 **"战力要求"** 效果为只有玩家战斗力满足条件时可使用物品

格式可以是 **"战力要求: 100"、"战斗要求: 100-1000"** 这种格式，更多的条件标签需自行探索
