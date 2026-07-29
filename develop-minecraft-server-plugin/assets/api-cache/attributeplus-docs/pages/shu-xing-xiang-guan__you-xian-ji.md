<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-xiang-guan/you-xian-ji -->
<!-- Snapshot date: 2026-07-29 -->

# 优先级 / 战斗力 / 公式 / 消息

## 说明[​](#说明 "说明的直接链接")

优先级主要用于控制属性的执行顺序，由 **低到高的顺序** 执行。  
不同 **属性类型** 的处理互不干扰，除 **other** 类型属性外的类型都有 **优先级** 而 **战斗力** 每个类型都有。

通过 **API新注册的属性** 也会在 **attribute.yml** 生成对应的配置节点，包括 **优先级、战斗力、属性名** 当属性支持自定义公式时还会生成 **自定义公式** 的配置节点。

## 优先级怎么调整？[​](#优先级怎么调整 "优先级怎么调整？的直接链接")

在 **attribute.yml** 配置内的 **priority** 项，优先级不能重复 (重复的话将会自动调整)  
每次 **通过任何方式新增属性** 时，请记得来此调整属性的优先级

```
#优先级  
priority:  
  attackOrDefense:  
    #如果闪避触发，则不会继续执行  
    dodge: 0  
    attack: 1  
    #如果优先级是 defense: 1， attack: 2 那样子防御属性就没意义了  
    defense: 2  
  update:   
    health: 100  
    moving: 101  
  runtime: []
```

## 战斗力怎么修改？[​](#战斗力怎么修改 "战斗力怎么修改？的直接链接")

在 **attribute.yml** 配置内的 **combatPower** 项，修改后可通过 **%ap\_combatPower%** 变量显示玩家身上当前的属性战斗力

```
#战斗力  
combatPower:  
  attackOrDefense:  
    attack: 1.0  
  update: []  
  runtime: []  
  other: []
```

## 属性公式相关[​](#属性公式相关 "属性公式相关的直接链接")

**为什么一些属性没有生成自定义公式的节点(?):** 那是因为该属性不支持自定义公式，是否支持自定义公式是由开发者在开发属性时所设置的，如果没有那就是不支持。  
  
**怎么修改属性公式?:** 在 **attribute.yml** 配置内的 **formula** 项，修改后 /ap reload 后即可生效

```
#属性公式  
#{attackerAttack} 当前 被攻击者 所受伤害(受优先级影响)  
#{entityAttack} 当前 攻击者 所受伤害(受优先级影响)(例如反弹伤害)  
#{value} 取得对应属性值  
#{entityA:属性名} 取得攻击者的对应属性值  
#{entityB:属性名} 取得被攻击者的对应属性值  
formula:   
  crit: "{attackerAttack}*{entityA:暴击倍率}/100"
```

## 属性提示消息[​](#属性提示消息 "属性提示消息的直接链接")

在 **attribute.yml** 配置内的 **message** 项，修改后 /ap reload 后即可生效，请注意下面配置的注释

```
#消息  
message:  
  #变量说明  
  #{attacker} 攻击者名称  
  #{entity} 被攻击者名称  
  #{attackerDamage} 此次事件 被攻击者 所受最终伤害  
  #{entityDamage} 此次事件 攻击者 所受最终伤害(例如反弹伤害)  
  #{属性变量} 此次事件该属性所造成的属性值 (例 {attack})  
  attack:  
    - "对 {entityB} 造成 {attackerDamage} 点伤害,穿透伤害 {see_through}"  
    - "{entityA} 对你造成 {attackerDamage} 点伤害"  
  #特别提醒:  
  #除 other 类属性外的所有属性点支持在这增加提示消息  
  #节点名格式固定为属性变量名,例如  
  #armor:  
  #  - "对方抵消了你百分之 {armor} 点伤害!"  
  #  - "你抵消了对方百分之 {armor} 点伤害!"
```
