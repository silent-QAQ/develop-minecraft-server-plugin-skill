<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/api -->
<!-- Snapshot date: 2026-07-29 -->

# API

```
/* 获取实体的属性数据 */  
fun getAttrData(entity: LivingEntity) : AttributeData = AttributePlus.attributeManager.getAttributeData(entity.uniqueId, entity)  
  
/*   
延迟任务  
ID相同的任务会被覆盖   
*/  
fun runEntityTask(millis: Long, id: String, entity: LivingEntity, block: () -> Unit)  
  
/* 获取物品上的 AttributeSource 数据 */  
fun getAttributeSource(itemStack: ItemStack, async: Boolean) = AttributeSource(itemStack, async)  
/* 获取 List 上的 AttributeSource 数据 */  
fun getAttributeSource(list: List<String>, async: Boolean) = AttributeSource(list, async)  
  
/* 增加一个源的属性数据 */  
fun addSourceAttribute(attributeData: AttributeData, source: String, attr: AttributeSource, async: Boolean = false)  
fun addSourceAttribute(attributeData: AttributeData, source: String, itemStack: ItemStack?, async: Boolean = false)  
fun addSourceAttribute(attributeData: AttributeData, source: String, list: List<String>?, async: Boolean = false)  
fun addSourceAttribute(attributeData: AttributeData, source: String, attribute: HashMap<String, Array<Number>>?, async: Boolean = false)  
  
/* 删除一个源的属性数据 */  
fun takeSourceAttribute(attributeData: AttributeData, source: String)  
  
/**  
* 造成一次伤害，该伤害不会触发 AttributePlus 属性伤害处理  
* 与 entity.damage(damage) 相比，该方法直接击杀目标击杀者会为 [attacker] 避免无击杀来源的情况  
*/  
fun attackTo(entity: LivingEntity, attacker: LivingEntity, damage: Double)  
  
  
/**  
* 执行一次无事件触发且经过 AttributePlus 属性处理的实体攻击  
* [attacker] 攻击者 [entity] 被攻击者 [damage] 伤害  
* [callBeforeEvent] 是否触发 AttrEntityDamageBeforeEvent 事件  
* [callCancel] 是否可被取消，关闭的情况下闪避属性这类属性的触发也将依旧受到伤害  
*  
* 这个造成的伤害不会有伤害来源，会直接对 [entity] 造成一次经过属性计算的伤害（不触发 EntityDamageByEntityEvent 事件）  
*/  
fun runAttributeAttackEntity(attacker: LivingEntity, entity: LivingEntity, damage: Double, callBeforeEvent: Boolean, callCancel: Boolean)  
  
/**  
* 使用 createAttributeSource 方法创建属性源将不触发 AttributeReadEvent 等事件  
* [content] 每一行属性格式必须为 "属性名:值" 或 "属性名:值(%)"  
*/  
fun createStaticAttributeSource(content: List<String>): AttributeSource  
/* 用上面的属性源处理方法，处理后将属性加到 AttributeData 目标上 */  
fun addStaticAttributeSource(data: AttributeData, source: String, content: List<String>)
```
