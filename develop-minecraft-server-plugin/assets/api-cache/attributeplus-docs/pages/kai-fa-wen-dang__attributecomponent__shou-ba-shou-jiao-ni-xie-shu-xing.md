<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/attributecomponent/shou-ba-shou-jiao-ni-xie-shu-xing -->
<!-- Snapshot date: 2026-07-29 -->

# Example

该示例已过时，实际开发请以导入依赖库显示为主，只有少部分方法更改，其他内容依旧可以参考当前示例。

## 属性说明[​](#属性说明 "属性说明的直接链接")

**需求:** 几率触发一次无法被 **物理防御 护甲防御** 所抵消的溟灭伤害，同时要求被攻击对象不为玩家才会触发  
这样子的属性，我们至少需要注册 **2** 个新属性，它们分别为 **溟灭几率(ATTACK) 溟灭伤害(OTHER)**

[**属性类型列表**](/docs/attributeplus/kai-fa-wen-dang/attributecomponent/attributetype)  
为什么 **溟灭伤害** 是 **OTHER** 类型呢？  
因为主要触发是 **溟灭几率** 属性，而 **溟灭伤害** 只是提供伤害数值

## 代码[​](#代码 "代码的直接链接")

以下代码使用 Kotlin 语言，在看之前请先阅读 [**属性名**](/docs/attributeplus/kai-fa-wen-dang/attributecomponent/shu-xing-ming-shuo-ming)

```
/* 属性默认名 */  
const val TEST = "溟灭几率"  
const val TEST_DAMAGE = "溟灭伤害"  
const val TEST_DEFENSE = "溟灭防御"
```

```
@AutoRegister  
class TestAttribute : SubAttribute(12, 5.0, TEST, AttributeType.ATTACK, "test") {  
  
    override fun runAttack(attacker: LivingEntity, entity: LivingEntity): Boolean {  
        //获取攻击者的 溟灭几率 属性值  
        val chance = attacker.getRandomValue().toDouble()  
        return chance.chance().apply {  
            if (this){  
                //获取攻击者的 溟灭伤害 属性值  
                val damage = attacker.getRandomValue(TEST_DAMAGE).toDouble()  
  
                //增加此次攻击者的伤害  
                attacker.addDamage(damage)  
            }  
        }  
    }  
  
    @AutoRegister  
    class TestDamageAttribute : SubAttribute(-1, 1.0, TEST_DAMAGE, AttributeType.OTHER, "test_damage")  
}
```

这样子就简简单单的完成了一个属性，什么? 你想要再加个 **溟灭防御** 属性？  
那很简单，这里 **溟灭防御** 也应该是个 OTHER 类属性，看下面代码

```
@AutoRegister  
class TestAttribute : SubAttribute(12, 5.0, TEST, AttributeType.ATTACK, "test") {  
  
    override fun runAttack(attacker: LivingEntity, entity: LivingEntity): Boolean {  
        //获取攻击者的 溟灭几率 属性值  
        val chance = attacker.getRandomValue().toDouble()  
        return chance.chance().apply {  
            if (this){  
                //获取攻击者的 溟灭伤害 属性值  
                var damage = attacker.getRandomValue(TEST_DAMAGE).toDouble()  
                  
                //获取被攻击者的 溟灭防御 属性值  
                damage -= entity.getRandomValue(TEST_DEFENSE).toDouble()  
  
                //增加此次攻击者的伤害  
                attacker.addDamage(damage)  
            }  
        }  
    }  
  
    @AutoRegister  
    class TestDamageAttribute : SubAttribute(-1, 1.0, TEST_DAMAGE, AttributeType.OTHER, "test_damage")  
  
    @AutoRegister  
    class TestDefenseAttribute : SubAttribute(-1, 1.0, TEST_DEFENSE, AttributeType.OTHER, "test_defense")  
}
```

是不是很简单，什么? 你还行要给溟灭属性加个 **提示消息**？

```
override fun onLoad(): SubAttribute {  
  
    //每次调用 getRandomValue() 时，都会自动临时储存属性值，再通过 {变量名} 显示  
    arrayListOf(  
        /*攻击者*/      
        "溟灭! 你对对方造成 {test_damage} 点溟灭伤害",  
        /*被攻击者*/      
        "溟灭! 对方对你造成 {test_damage} 点溟灭伤害,你抵消 {test_defense} 点溟灭伤害"  
    ).setMessages()  
      
    return this  
}
```

什么？你想让 **被攻击者** 直接显示 **最终所受到的溟灭伤害**？

```
override fun onLoad(): SubAttribute {  
    //每次调用 getRandomValue() 时，都会自动临时储存属性值，再通过 {变量名} 显示  
    arrayListOf(  
        /*攻击者*/      
        "溟灭! 你对对方造成 {test_damage} 点溟灭伤害",  
        /*被攻击者*/      
        "溟灭! 对方对你造成 {test_defense} 点溟灭伤害"  
    ).setMessages()  
      
    return this  
}  
  
override fun runAttack(attacker: LivingEntity, entity: LivingEntity): Boolean {  
    //获取攻击者的 溟灭几率 属性值  
    val chance = attacker.getRandomValue().toDouble()  
    return chance.chance().apply {  
        if (this){  
            //获取攻击者的 溟灭伤害 属性值  
            var damage = attacker.getRandomValue(TEST_DAMAGE).toDouble()  
            //获取被攻击者的 溟灭防御 属性值  
            damage -= entity.getRandomValue(TEST_DEFENSE).toDouble()  
  
            //储存数据值，因为上方已经调用了 entity.getRandomValue(TEST_DEFENSE).toDouble() 方法  
            //所以这里我们要初始化一下值  
            ("test_defense" to damage).storageValue(true)  
              
            //增加此次攻击者的伤害  
            attacker.addDamage(damage)  
        }  
    }  
}
```

你还想要支持**自定义公式**？

```
//属性注册后会在 attribute.yml 配置生成对应的配置节点  
  
override fun onLoad(): SubAttribute {  
    //每次调用 getRandomValue() 时，都会自动临时储存属性值，再通过 {变量名} 显示  
    arrayListOf(  
        /*攻击者*/  
        "溟灭! 你对对方造成 {test_damage} 点溟灭伤害",  
        /*被攻击者*/  
        "溟灭! 对方对你造成 {test_defense} 点溟灭伤害"  
    ).setMessages()  
  
    //设置默认的属性公式  
    "{entityA:溟灭伤害}+({entityB:生命力}*0.5)".setFormula()  
    return this  
}  
  
override fun runAttack(attacker: LivingEntity, entity: LivingEntity): Boolean {  
    //获取攻击者的 溟灭几率 属性值  
    val chance = attacker.getRandomValue().toDouble()  
    return chance.chance().apply {  
        if (this){  
            //获取公式计算后的值  
            var damage = getFormulaValue {  
                //这里面是默认公式的计算方法，由于 1.7.10 无法使用公式计算，所以会执行这里来获取计算值  
                val health = entity.getRandomValue(AttributeName.HEALTH.toDefaultName()).toDouble()  
                //返回值 (Kotlin 就是这么方便)  
                attacker.getRandomValue(TEST_DAMAGE).toDouble()+(health * 0.5)  
            }  
  
            //获取被攻击者的 溟灭防御 属性值  
            damage -= entity.getRandomValue(TEST_DEFENSE).toDouble()  
  
            //储存数据值，因为上方已经调用了 entity.getRandomValue(TEST_DEFENSE).toDouble() 方法  
            //所以这里我们要初始化一下值  
            ("test_defense" to damage).storageValue(true)  
  
            //增加此次攻击者的伤害  
            attacker.addDamage(damage)  
        }  
    }  
}
```

## 后续[​](#后续 "后续的直接链接")

为了确保 **溟灭伤害** 不会被 **物理防御 护甲防御** 所抵消，你需要把 **溟灭几率** 属性的优先级调至 **物理防御 护甲防御** 属性 **之后** 这个可以由用户自行调整

写完属性后，当然就是注册属性了，这里请使用 **@AutoRegister** 注释进行自动注册，最后再插件是在**plugin.yml** 依赖上加 **AttributePlus** 这样子就完成了

## 最终代码[​](#最终代码 "最终代码的直接链接")

```
package org.serverct.ersha.attribute.sub.attack  
  
import org.bukkit.entity.LivingEntity  
import org.serverct.ersha.api.annotations.AutoRegister  
import org.serverct.ersha.api.component.SubAttribute  
import org.serverct.ersha.api.enums.AttributeName  
import org.serverct.ersha.attribute.enums.AttributeType  
  
const val TEST = "溟灭几率"  
const val TEST_DAMAGE = "溟灭伤害"  
const val TEST_DEFENSE = "溟灭防御"  
  
@AutoRegister  
//属性注册后会在 attribute.yml 配置生成对应的配置节点  
class TestAttribute : SubAttribute(12, 5.0, TEST, AttributeType.ATTACK, "test") {  
  
    override fun onLoad(): SubAttribute {  
        //每次调用 getRandomValue() 时，都会自动临时储存属性值，再通过 {变量名} 显示  
        arrayListOf(  
            /*攻击者*/  
            "溟灭! 你对对方造成 {test_damage} 点溟灭伤害",  
            /*被攻击者*/  
            "溟灭! 对方对你造成 {test_defense} 点溟灭伤害"  
        ).setMessages()  
  
        //设置默认的属性公式  
        "{entityA:溟灭伤害}+({entityB:生命力}*0.5)".setFormula()  
        return this  
    }  
  
    override fun runAttack(attacker: LivingEntity, entity: LivingEntity): Boolean {  
        //获取攻击者的 溟灭几率 属性值  
        val chance = attacker.getRandomValue().toDouble()  
        return chance.chance().apply {  
            if (this){  
                //获取公式计算后的值  
                var damage = getFormulaValue {  
                    //这里面是默认公式的计算方法，由于 1.7.10 无法使用公式计算，所以会执行这里来获取计算值  
                    val health = entity.getRandomValue(AttributeName.HEALTH.toDefaultName()).toDouble()  
                    //返回值 (Kotlin 就是这么方便)  
                    attacker.getRandomValue(TEST_DAMAGE).toDouble()+(health * 0.5)  
                }  
  
                //获取被攻击者的 溟灭防御 属性值  
                damage -= entity.getRandomValue(TEST_DEFENSE).toDouble()  
  
                //储存数据值，因为上方已经调用了 entity.getRandomValue(TEST_DEFENSE).toDouble() 方法  
                //所以这里我们要初始化一下值  
                ("test_defense" to damage).storageValue(true)  
  
                //增加此次攻击者的伤害  
                attacker.addDamage(damage)  
            }  
        }  
    }  
  
    @AutoRegister  
    class TestDamageAttribute : SubAttribute(-1, 1.0, TEST_DAMAGE, AttributeType.OTHER, "test_damage")  
  
    @AutoRegister  
    class TestDefenseAttribute : SubAttribute(-1, 1.0, TEST_DEFENSE, AttributeType.OTHER, "test_defense")  
}
```
