<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/readcomponent/ -->
<!-- Snapshot date: 2026-07-29 -->

# ReadComponent

public DescriptionRead(DescriptionRead.ReadPriority priority, DescriptionRead.AttributeReadType type, Boolean filterColor)

```
//请继承 DescriptionRead 类注册组件  
interface ReadComponent {  
  
    //读取优先级  
    val priority: DescriptionRead.ReadPriority  
    //读取类型  
    val type: DescriptionRead.AttributeReadType  
    //是否过滤掉颜色代码  
    val filterColor: Boolean  
  
    /**  
     * 属性数据读取  
     * [key] 读取的标签  
     * [lore] 需要读取数据的描述  
     *  
     * 通过自己的方式将 [key] 的内容读取为属性数据 Array<Number>  
     * [lore] 一定包含 [key] 属性标签,所以不需要去 lore.contains(attributeName) 了  
     */  
    fun read(key: String, lore: String): Array<Number>  
  
    /**  
    * 作用与 read(key: String, lore: String) 相同  
    */  
    fun read(key: String, lore: String, source: AttributeSource): Array<Number>  
  
    /**  
     * 条件判断  
     * [entity] 实体  
     * [lore] 需要读取数据的描述  
     *  
     * 如果条件不满足，那么将不会执行 read 方法  
     */  
    fun condition(entity: LivingEntity, lore: String): Boolean  
  
    /**  
     * 作用与 condition(entity: LivingEntity, lore: String) 相同  
     */  
    fun condition(entity: LivingEntity, lore: String, source: AttributeSource): Boolean  
  
    /**  
     * 注册组件  
     *  
     * @AutoRegister 请使用自动注册注释注册  
     */  
    fun register()  
  
    /**  
     * 注销组件  
     */  
    fun unregister()  
}
```

## 读取类型[​](#读取类型 "读取类型的直接链接")

```
/**  
 * VALUE -> 该类型会执行 read 与 condition 方法  
 * BOOLEAN -> 该类型只执行 condition 方法  
 * RUNTIME -> 该类型与 VALUE 相同，但返回的值不会计入属性  
 */  
enum class AttributeReadType {  
    VALUE, BOOLEAN, RUNTIME  
}
```

## 读取优先级[​](#读取优先级 "读取优先级的直接链接")

```
/**  
 * 优先执行 BEFORE 的读取组件  
 * AFTER 所有组件是在 BEFORE 所有组件处理完后才执行  
 */  
enum class ReadPriority {  
    BEFORE, AFTER  
}
```
