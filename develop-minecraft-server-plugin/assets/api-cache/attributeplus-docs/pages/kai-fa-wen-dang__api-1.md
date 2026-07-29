<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/api-1 -->
<!-- Snapshot date: 2026-07-29 -->

# Counter 计数器

### **获取 Counter 主控对象：**[​](#获取-counter-主控对象 "获取-counter-主控对象的直接链接")

```
AttributeData data = ...  
data.getCounter() //主控对象
```

### **创建新的计数器：**[​](#创建新的计数器 "创建新的计数器的直接链接")

```
ItemCounterResetType 类型：  
DEFUALT 该类型的计数器需要手动重置记录值  
DEATH 该类型的计数器在玩家死亡时会重置记录值
```

```
AttributeData data = ...
AttributeCounter counter = data.getCounter() //主控对象
counter.getCounter("计数器名称", ItemCounterResetType.DEFUALT) //计数器
```

### **计数器相关方法：**[​](#计数器相关方法 "计数器相关方法的直接链接")

```
/**  
 * 更新计数器记录数值  
 * [update] 数值 [default] 默认值(即该计数器未操作过时的默认值)  
 */  
 fun updateValue(update: Double, default: Double): Double  
   
 /**  
  * 设置计数器记录数值  
  * [value] 数值  
  */  
 fun setValue(value: Double): Double  
   
 /**  
  * 设置计数器文本记录  
  * [update] 文本  
  */  
fun updateContent(update: String): String  
  
/**  
 * 获取计数器记录数值  
 * [default] 默认值(即该计数器未操作过时的默认值)  
 */  
fun getValue(default: Double): Double  
  
/**  
 * 获取计数器记录文本  
 * [default] 默认值(即该计数器未操作过时的默认值)   
 */  
fun getContent(default: String): String  
  
/**  
 * 重置计数器记录数值  
 */  
fun resetValue()  
  
/**  
 * 重置计数器记录文本  
 */  
fun resetContent()
```

### **JavaScript** 中使用计数器示例：[​](#javascript-中使用计数器示例 "javascript-中使用计数器示例的直接链接")

以下例子使用 **KILLER** 脚本类型作为示例

```
var priority = 1  
var combatPower = 1.0  
var attributeName = "KILLER_ATTRIBUTE"  
var attributeType = "KILLER"  
var placeholder = "KILLER_ATTRIBUTE"  
  
function onLoad(attr){  
  return attr  
}  
  
function runKiller(attr, killer, entity, handle) {  
  //获取击杀者的 AttributeData 对象  
  var data = attr.getData(killer, handle)  
  //获取创建一个名为 reaper_count 的计算，重置类型为 DEATH 死亡时重置  
  var counter = data.counter.getCounter("reaper_count", "DEATH")  
    
  //更新计数器值 +1 默认值为 0  
  var value = counter.updateValue(1, 0)  
  //判断计数器计数值是否大于等于 3 次  
  if (value >= 3) {  
    //重置计数器值  
    counter.resetValue()  
    killer.sendMessage("§a§lKILLER_ATTRIBUTE 触发")  
  } else {  
    killer.sendMessage("§a§lKILLER_ATTRIBUTE §f§l" + value + "/3")  
  }  
}
```
