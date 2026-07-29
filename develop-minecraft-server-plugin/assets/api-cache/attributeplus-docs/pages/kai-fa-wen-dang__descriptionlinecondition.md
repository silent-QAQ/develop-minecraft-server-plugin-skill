<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/descriptionlinecondition -->
<!-- Snapshot date: 2026-07-29 -->

# CustomTriggerComponent

请结合 [**CUSTOM**](/docs/attributeplus/shu-xing-jiao-ben/shou-ba-shou-jiao-ni-xie-shu-xing-jiao-ben/update-lei-xing-1) 类型属性教学页面开发

```
interface CustomTriggerComponent<E: Event> {  
  
    //触发器名称  
    val name: String  
      
    //触发器事件  
    val event: Class<E>  
      
    //触发器事件监听优先级  
    val priority: EventPriority  
      
    //触发器事件是否忽略取消  
    val ignoreCancelled: Boolean  
  
    /**  
     * 触发器触发条件,条件不满足时将不触发处理  
     * [event] 触发器此次事件  
     */  
    fun condition(event: E): Boolean {  
        return true  
    }  
  
    /**  
     * 触发者对象传入  
     * [event] 触发器此次事件  
     */  
    fun caster(event: E): LivingEntity  
  
    /**  
     * 目标对象传入  
     * [event] 触发器此次事件  
     */  
    fun target(event: E): LivingEntity? {  
        return null  
    }  
  
    /**  
     * 触发事件相关参数传入，可在 runCustom 属性处理方法获取  
     * [event] 触发器此次事件  
     */  
    fun params(event: E): Array<Any> {  
        return emptyArray()  
    }  
  
    /* 注册触发器 */  
    fun register() {  
        attributeManager.registerTrigger(this)  
    }  
}
```

## 示例[​](#示例 "示例的直接链接")

玩家使用 **SkillAPI** 技能时触发属性，触发器名称为 "`SKILL CAST`"

```
class SkillCastAttributeTrigger : CustomTriggerComponent<PlayerCastSkillEvent> {  
  
    override val name: String = "SKILL CAST"  
  
    override val event: Class<PlayerCastSkillEvent> = PlayerCastSkillEvent::class.java  
  
    override val priority: EventPriority = EventPriority.NORMAL  
  
    override val ignoreCancelled: Boolean = false  
  
    override fun caster(event: PlayerCastSkillEvent): LivingEntity {  
        return event.player  
    }  
  
    override fun params(event: PlayerCastSkillEvent): Array<Any> {  
        val skillName = event.skill.data.name  
        return arrayOf(skillName)  
    }  
  
}
```

玩家使用 **SkillAPI** 技能对玩家类型的实体造成伤害时触发，触发器名称为 "`SKILL DAMAGE PLAYER`"

```
class SkillDamagePlayerAttributeTrigger : CustomTriggerComponent<SkillDamageEvent> {  
  
    override val name: String = "SKILL DAMAGE PLAYER"  
  
    override val event: Class<SkillDamageEvent> = SkillDamageEvent::class.java  
  
    override val priority: EventPriority = EventPriority.NORMAL  
  
    override val ignoreCancelled: Boolean = false  
  
    override fun condition(event: SkillDamageEvent): Boolean {  
        return event.target is Player  
    }  
  
    override fun caster(event: SkillDamageEvent): LivingEntity {  
        return event.damager  
    }  
  
    override fun target(event: SkillDamageEvent): LivingEntity? {  
        return event.target  
    }  
  
    override fun params(event: SkillDamageEvent): Array<Any> {  
        val damage = event.damage  
        val classification = event.classification  
        return arrayOf(damage, classification)  
    }  
  
}
```
