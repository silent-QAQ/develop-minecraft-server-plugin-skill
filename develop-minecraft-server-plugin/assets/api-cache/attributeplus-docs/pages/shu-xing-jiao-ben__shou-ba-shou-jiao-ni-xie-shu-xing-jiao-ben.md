<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-jiao-ben/shou-ba-shou-jiao-ni-xie-shu-xing-jiao-ben/ -->
<!-- Snapshot date: 2026-07-29 -->

# 脚本教学

## 属性说明[​](#属性说明 "属性说明的直接链接")

需求: 几率触发一次无法被 物理防御 护甲防御 所抵消的溟灭伤害，同时要求被攻击对象不为玩家才会触发  
这样子的属性，我们至少需要注册 2 个新属性，它们分别为 `溟灭几率(ATTACK) 溟灭伤害(OTHER)`   
  
[属性类型列表](/docs/attributeplus/kai-fa-wen-dang/attributecomponent/attributetype)  
为什么 `溟灭伤害` 是 `OTHER` 类型呢？  
因为主要触发是 `溟灭几率` 属性，而 `溟灭伤害` 只是提供伤害数值

## 代码[​](#代码 "代码的直接链接")

在 **script/** 文件夹内新建 **溟灭属性.js** 文件，然后先写属性的基本内容

```
/* 每个脚本必须先写几个变量，否则属性无法注册 */  
  
/*这里可以先随便设,最后需要去 attribute.yml 按实际情况调整优先级*/  
var priority = 13  
/*默认的战斗力*/  
var combatPower = 5.0  
/*默认属性名*/  
var attributeName = "溟灭几率"  
/*属性类型*/  
var attributeType = "ATTACK"  
/*属性变量 (%ap_testAttribute%)*/  
var placeholder = "testAttribute"
```

```
var priority = 13  
var combatPower = 5.0  
var attributeName = "溟灭几率"  
var attributeType = "ATTACK"  
var placeholder = "testAttribute"  
  
/* 每个属性再注册时都会调用该方法，也可以忽略不写 */  
function onLoad(attr) {  
    /* 溟灭属性需要通过 溟灭伤害 来提供伤害值,所以我们得注册一个 OTHER 的 溟灭伤害 属性 */  
    /* 这里注册的属性 attribute.yml 也会生成相对应的配置内容*/  
    Utils.registerOtherAttribute("溟灭伤害", 1.0, "testAttributeDamage")  
      
    /* 必须返回 attr */  
    return attr  
}  
  
/* 因为属性是 ATTACK 类型,所以我们需要写 runAttack 方法 */  
/* attacker 为攻击者，entity 为被攻击者*/  
function runAttack(attr, attacker, entity, handle) {  
    /* 判断是否非玩家 */  
    if (!Utils.isType(entity, Arrays.asList(EntityType.PLAYER))){  
        /* 前面提过 Attr 代表这个属性类的本身,所以可以用来调用 AttributeComponent 内的方法 */  
        var value = attr.getRandomValue(attacker, handle)  
        /* 通过 Attr 内提供的方法,决定此次属性是否触发 */  
        var chance = attr.chance(value)  
      
        if (chance) {  
            /* 当触发时获取攻击者身上的 溟灭伤害 属性值,这次范围随机 */  
            var damage = attr.getRandomValue(attacker, "溟灭伤害", handle)  
            attr.addDamage(attacker, damage, handle)  
        }  
    }  
  
    /* true 则会显示提示语 */  
    /* false 则不会显示提示语*/  
    return chance  
}
```

以上，简单的 **溟灭** 属性就写好了，脚本属性也可以设置提示消息，与 Java 或 Kotlin 开发的一样，我们只需要在 **onLoad()** 方法内写就可以了，例如以下

```
function onLoad(attr) {  
    Utils.registerOtherAttribute("溟灭伤害", 1.0, "testAttributeDamage")  
      
    /* 调用 Attr 内的 setMessages 方法*/  
    attr.setMessages(Arrays.asList(  
        /*攻击者*/  
        "溟灭! 你对对方造成 {testAttributeDamage} 点溟灭伤害",  
        /*被攻击者*/      
        "溟灭! 对方对你造成 {testAttributeDamage} 点溟灭伤害"  
    ))  
    return attr  
}
```

以上 setMessages 方法调用后就可以设置提示消息了，同时属性脚本也可以使用自定义公式的功能，具体如下

```
function onLoad(attr) {  
    Utils.registerOtherAttribute("溟灭伤害", 1.0, "testAttributeDamage")  
      
    attr.setMessages(Arrays.asList(  
        /*攻击者*/  
        "溟灭! 你对对方造成 {testAttributeDamage} 点溟灭伤害",  
        /*被攻击者*/      
        "溟灭! 对方对你造成 {testAttributeDamage} 点溟灭伤害"  
	  ))  
	  
	  /*  
	    伤害 = 攻击者的溟灭伤害 + 被攻击者的生命力*0.5   
	    默认公式设置后 attribute.yml 也会生成对应配置节点,可在配置重复修改,这里是生成时默认公式  
	  */  
	  attr.setFormula("{entityA:溟灭伤害}+({entityB:生命力}*0.5)")  
    return attr  
}  
  
function runAttack(attr, attacker, entity, handle) {  
    if (!Utils.isType(entity, Arrays.asList(EntityType.PLAYER))){  
        var value = attr.getRandomValue(attacker, handle)  
        var chance = attr.chance(value)  
      
        if (chance) {  
            /* 将 var damage = Attr.getRandomValue(attacker, "溟灭伤害") 改为以下 */  
            var damage = attr.getFormulaValue(function(){  
                //这里面是默认公式的计算方法，由于 1.7.10 无法使用公式计算，所以会执行这里来获取计算值  
                  
                var health = attr.getRandomValue(entity, "生命力", handle)  
                return attr.getRandomValue(attacker, "溟灭伤害", handle) + (health * 0.5)  
            })  
            attr.addDamage(attacker, damage, handle)  
        }  
    }  
      
    return chance  
}
```

## 后续[​](#后续 "后续的直接链接")

为了确保 **溟灭伤害** 不会被 **物理防御 护甲防御** 所抵消，你需要把 **溟灭几率** 属性的优先级调至 **物理防御 护甲防御** 属性 **之后** 这个可以由用户自行调整
