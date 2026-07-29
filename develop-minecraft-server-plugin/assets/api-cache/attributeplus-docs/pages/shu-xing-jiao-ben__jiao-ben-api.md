<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-jiao-ben/jiao-ben-api -->
<!-- Snapshot date: 2026-07-29 -->

# 脚本方法

相关方法于 **2024/08/29** 日更新

## 使用方法[​](#使用方法 "使用方法的直接链接")

在属性脚本内使用 **Utils.方法名(参数)** 进行调用

```
/* 获取实体属性数据 */   
fun getAttrData(entity: LivingEntity): AttributeData  
  
/* 快捷注册 OTHER 类属性 */  
fun registerOtherAttribute(attributeName: String, combatPower: Double, placeholder: String)  
  
/* 获取实体周围内的实体 */  
fun getNearbyEntities(entity: LivingEntity, x: Double, y: Double, z: Double, self: Boolean): List<Entity>  
  
/* 获取实体周围内的指定类型实体 */  
fun getNearbyEntities(entity: LivingEntity, x: Double, y: Double, z: Double, self: Boolean, type: List<EntityType>?): List<Entity>  
  
/* 对指定实体造成一次性伤害 */  
fun damageEntity(damage: Double, entity: LivingEntity, killer: LivingEntity)  
  
/* 判断实体类型 */  
fun isType(entity: LivingEntity, type: List<EntityType>): Boolean  
  
/* 计算变量值,实体必须为玩家否则返回 0.0 */  
fun calculatorPlaceholder(player: LivingEntity, expr: String): Double  
  
/* PlaceholderAPI 占位符替换 */  
fun placeholder(player: LivingEntity, context: String): String  
  
/* PlaceholderAPI 占位符替换并返回为 Double 如果不符合则返回 [default] 值 */  
fun placeholderToDouble(player: LivingEntity, context: String, default: Double): Double  
  
/* 判断目标对象是否进入名为 [key] 的冷却,冷却中返回false,否则返回true并进入[time]秒冷却 */  
fun hasCooling(key: String, entity: LivingEntity, time: Int): Boolean  
fun hasCooling(key: String, entity: LivingEntity, time: Double): Boolean  
/* 判断目标对象是否进入名为 [key] 的冷却,冷却中返回false,否则返回true */  
fun hasCooling(key: String, entity: LivingEntity): Boolean  
/* 重置目标对象名为 [key] 的冷却状态 */  
fun resetCooling(key: String, entity: LivingEntity)  
  
  
/* 如果冷却目标非玩家,则请使用以下方法进行冷却处理 */  
/* 判断目标对象是否进入名为 [key] 的冷却,冷却中返回false,否则返回true并进入[time]秒冷却 */  
fun hasEntityCooling(key: String, entity: LivingEntity, time: Int): Boolean  
fun hasEntityCooling(key: String, entity: LivingEntity, time: Double): Boolean  
/* 判断目标对象是否进入名为 [key] 的冷却,冷却中返回false,否则返回true */  
fun hasEntityCooling(key: String, entity: LivingEntity): Boolean  
/* 重置目标对象名为 [key] 的冷却状态 */  
fun resetEntityCooling(key: String, entity: LivingEntity)  
  
/* 恢复目标生命值 */  
fun safeHeal(entity: LivingEntity, heal: Double)
```
