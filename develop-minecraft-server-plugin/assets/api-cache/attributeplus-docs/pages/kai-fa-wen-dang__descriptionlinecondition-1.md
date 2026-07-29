<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/descriptionlinecondition-1 -->
<!-- Snapshot date: 2026-07-29 -->

# EmbeddedCondition

## 跟 DescriptionRead 有什么区别呢?[​](#跟-descriptionread-有什么区别呢 "跟 DescriptionRead 有什么区别呢?的直接链接")

> **DescriptionRead** 无法做到单独新增一个 **内嵌式条件** 必须同时覆写 read 与 condition 才能做到,这相当于需要完全重写一个读取组件  
>   
> 具体读取格式请查看 [**属性内嵌条件格式**](/docs/attributeplus/du-qu-xiang-guan/shu-xing-du-qu-tiao-jian)

```
/**  
 * 单行描述条件  
 * 格式 "属性名: 值 / <条件>" 如果满足该行条件才会读取该行描述属性  
 *   
 * 如何注册? : 使用 @AutoRegister 进行注册  
 */  
interface DescriptionLineCondition : DescriptionComponent {  
  
    /**  
     * [entity] 可为空需要自行判断  
     * [text] 为 "<属性内容> / <条件>" 中的 <条件> 内容  
     * 返回值为 true 时则读取属性,为 false 时则不读取  
     */  
    fun condition(entity: LivingEntity?, text: String): Boolean  
      
    fun condition(entity: LivingEntity?, text: String, slot: EquipmentSlot?): Boolean{  
        return this.condition(entity, lore)  
    }  
      
    fun condition(entity: LivingEntity?, text: String, slot: EquipmentSlot?, item: ItemStack?): Boolean {  
        return this.condition(entity, lore, slot)  
    }  
}
```

## 示例[​](#示例 "示例的直接链接")

```
@AutoRegister  
class LineCondition : DescriptionLineCondition {  
  
    override fun condition(entity: LivingEntity?, lore: String): Boolean {  
        if (entity == null){  
            return true  
        } else {  
            if (entity is Player){  
                if (lore.contains("等级要求-")) {  
                    val value = lore.split("等级要求-")[1]  
                    return entity.level >= value.toInt()  
                }  
            }  
            return true  
        }  
    }  
}
```

> 以上示例在实际使用中格式是 "物理伤害: 1000 **/** 等级要求-100"  
> 等级大于等于 100 时就会激活该行属性,增加 1000 点物理伤害  
>   
> 条件只能写在 **" / "** 右边
