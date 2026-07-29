<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/kai-fa-wen-dang/attributecomponent/ -->
<!-- Snapshot date: 2026-07-29 -->

# AttributeComponent

`public SubAttribute(Int priority, Double combatPower, String attributeName,` [**`AttributeType`**](/docs/attributeplus/kai-fa-wen-dang/attributecomponent/attributetype) `attributeType, String placeholder)`

- 2024/11/12 新增方法
  - ```
    /**  
     * 忽略此次属性处理事件取消状态,无论是否取消都必定执行  
     */  
    fun Boolean.setIgnoreCancelled()  
      
    /**  
     * 判断此次是否忽略取消  
     */  
    fun isIgnoreCancelled(): Boolean
    ```
- 2023/02/04 新增方法
  - ```
    /**  
    * 增加实体此次属性处理事件对某个属性的属性值  
    * [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
    */  
    fun LivingEntity.addAttribute(defaultAttributeName: String, value: Double)  
      
    /**  
    * 减少实体此次属性处理事件对某个属性的属性值  
    * [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
    */  
    fun LivingEntity.takeAttribute(defaultAttributeName: String, value: Double)  
      
    /**  
    * 设置实体此次属性处理事件对某个属性的属性值  
    * [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
    */  
    fun LivingEntity.setAttribute(defaultAttributeName: String, value: Double)  
      
    /**  
    * 取消实体此次属性处理事件对某个属性的触发  
    * [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
    */  
    fun LivingEntity.cancelAttribute(defaultAttributeName: String)
    ```

## 完整接口类[​](#完整接口类 "完整接口类的直接链接")

```
//优先级  
var priority: Int  
//属性战斗力  
var combatPower: Double  
//属性默认名 (默认名 与 服务器内修改的属性名 不同)  
val attributeName: String  
//属性类型  
val attributeType: AttributeType  
//属性变量名 (请全部使用小写)  
val placeholder: String  
  
/**  
 * [attacker] 攻击者  
 * [entity] 被攻击者  
 *  
 * ATTACK 类属性时生效  
 * 返回值为 true 时将触发属性提示语(未设置消息则无论如何都不触发)  
 */  
fun runAttack(attacker: LivingEntity, entity: LivingEntity): Boolean  
  
/**  
 * [entity] 被攻击者  
 * [killer] 攻击者  
 *  
 * DEFENSE 类属性时生效  
 * 返回值为 true 时将触发属性提示语(未设置消息则无论如何都不触发)  
 */  
fun runDefense(entity: LivingEntity, killer: LivingEntity): Boolean  
  
/**  
 * [entity] 自身  
 *  
 * UPDATE RUNTIME 类属性是生效  
 * 返回值为 true 时将触发属性提示语(未设置消息则无论如何都不触发)  
 */  
fun run(entity: LivingEntity): Boolean  
  
/**  
 * 属性加载时执行  
 */  
fun onLoad(): SubAttribute  
  
/**  
 * 注册属性  
 *  
 * @AutoRegister 请使用自动注册注释注册  
 */  
fun registerAttribute()  
  
/**  
 * 此次是否为远程攻击伤害  
 */  
fun isProjectileDamage(): Boolean  
  
/**  
* 获取此次攻击蓄力强度 (1.0~100.0)  
* 该方法会根据玩家原版攻击蓄力机制削弱伤害 (攻击间隔越快伤害越低)  
* 仅对玩家生效  
*/  
fun getDamageIntensity(): Double  
  
/**  
 * 获得实体的属性数据  
 *  
 * Java 方法为  getData(entity LivingEntity)  
 */  
fun LivingEntity.getData(): AttributeData  
  
/**  
 * 获得实体某一属性的属性值数据  
 */  
fun LivingEntity.getAttributeValue(defaultAttributeName: String): Array<Number>  
  
/**  
 * 获得实体当前属性的属性值数据  
 */  
fun LivingEntity.getAttributeValue(): Array<Number>  
  
/**  
 * 获取实体某一属性的随机值  
 * 调用该方法会将所获取的属性值储存至临时数据，相当于自动调用 storageValue() 方法  
 */  
fun LivingEntity.getRandomValue(defaultAttributeName: String): Number  
  
/**  
 * 获取实体当前属性的随机值  
 * 调用该方法会将所获取的属性值储存至临时数据，相当于自动调用 storageValue() 方法  
 */  
fun LivingEntity.getRandomValue(): Number  
  
/**  
 * 获取实体此次属性处理事件对对方所造成的伤害  
 * attacker / killer 则为攻击者所造成的伤害 (例如 物理伤害)  
 * entity 则为被攻击者的反击伤害 (例如 反弹伤害)  
 */  
fun LivingEntity.getDamage(): Number  
  
/**  
 * 设置实体此次属性处理事件对对方所造成的伤害  
 */  
fun LivingEntity.setDamage(value: Double)  
  
/**  
 * 增加实体此次属性处理事件对对方所造成的时候  
 */  
fun LivingEntity.addDamage(value: Double)  
  
/**  
 * 减少实体此次属性处理事件对对方所造成的时候  
 */  
fun LivingEntity.takeDamage(value: Double)  
  
/**  
* 增加实体此次属性处理事件对某个属性的属性值  
* [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
*/  
fun LivingEntity.addAttribute(defaultAttributeName: String, value: Double)  
  
/**  
* 减少实体此次属性处理事件对某个属性的属性值  
* [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
*/  
fun LivingEntity.takeAttribute(defaultAttributeName: String, value: Double)  
  
/**  
* 设置实体此次属性处理事件对某个属性的属性值  
* [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
*/  
fun LivingEntity.setAttribute(defaultAttributeName: String, value: Double)  
  
/**  
* 取消实体此次属性处理事件对某个属性的触发  
* [defaultAttributeName] 为注册属性时的默认名 (非服务器修改后的名字)  
*/  
fun LivingEntity.cancelAttribute(defaultAttributeName: String)  
  
/**  
 * 将属性值储存至临时数据，用于 message 提示所显示的属性值  
 * Java 请使用  Data<String, Double>.storageValue() 等方法  
 *  
 * [init] 是否为初始值，防止调用 getRandomValue() 后导致储存值错误  
 */  
fun Pair<String, Double>.storageValue(init: Boolean)  
  
/**  
 * 与 Pair<String, Double>.storageValue(init: Boolean) 方法相同  
 * 但不会初始化数据值，会直接增加上去  
 */  
fun Pair<String, Double>.storageValue()  
  
/**  
 * Java 请使用该方法储存，与 Pair<String, Double>.storageValue(init: Boolean) 方法相同  
 */  
fun Data<String, Double>.storageValue(init: Boolean)  
  
fun Data<String, Double>.storageValue()  
  
/**  
* JavaScript 请使用该方法储存，与 Pair<String, Double>.storageValue(init: Boolean) 方法相同  
*/  
fun storageValue(placeholder: String, value: Double, init: Boolean)  
  
fun storageValue(placeholder: String, value: Double)  
  
/**  
 * 设置属性触发时的提示消息 [replaceAttack] 为是否替换 Attack 属性提示语  
 * 如果 [replaceAttack] 为 True 那属性触发时 Attack 攻击提示则不会显示  
 *  
 * 当属性内有设置 message 时,属性第一次注册会在 attribute.yml 生成对应配置  
 */  
fun List<String>.setMessages(replaceAttack: Boolean)  
  
/**  
 * 设置属性提示消息  
 */  
fun List<String>.setMessages()  
  
/**  
 * 取消此次属性处理事件的处理，相当于此次所有属性都不处理，也不会受到伤害  
 */  
fun Boolean.setCancelled()  
  
/**  
 * 忽略此次属性处理事件取消状态,无论是否取消都必定执行  
 */  
fun Boolean.setIgnoreCancelled()  
  
/**  
 * 判断此次是否忽略取消  
 */  
fun isIgnoreCancelled(): Boolean  
  
/**  
 * 是否跳过过滤，跳过的话不管属性值是否 >0.0 都会触发,否则只有玩家属性值 >=1.0 是才会触发  
 */  
fun Boolean.setSkipFilter()  
  
/**  
 * 几率触发  
 */  
fun Double.chance(): Boolean  
  
/**  
 * 设置属性公式  
 *  
 * 当属性内有设置 formula 时,属性第一次注册会在 attribute.yml 生成对应配置  
 */  
fun String.setFormula()  
  
/**  
 * 获取属性公式计算后的值  
 *  
 * [defaultFormula] 为默认的公式，因为 1.7.10 与 Mohist 核心不支持自定义公式  
 * 当不支持自定义公式时将通过默认公式取值  
 */  
fun getFormulaValue(defaultFormula: () -> Double): Double  
  
/**  
 * 属性是否异步执行，部分方法无法通过异步执行(例如 Player.setWalkSpeed )，这里可以将属性设为非异步执行  
 */  
fun Boolean.setAsync()  
  
/**  
* 实时更新状态修改  
*/  
fun Boolean.setSyncUpdateState()  
  
fun getCombatPower(value: Array<Number>): Double  
  
/**  
 * 通过 属性默认名 返回属性的变量  
 */  
fun String.toPlaceholder(): String {  
    return AttributePlus.attributeManager.attributeData[this]!![1].toString()  
}  
  
/**  
 * 通过 属性默认名 获取 服务器内修改后的属性名  
 */  
fun String.toServerName(): String {  
    return AttributePlus.attributeManager.defaultKey[this] ?: this  
}
```
