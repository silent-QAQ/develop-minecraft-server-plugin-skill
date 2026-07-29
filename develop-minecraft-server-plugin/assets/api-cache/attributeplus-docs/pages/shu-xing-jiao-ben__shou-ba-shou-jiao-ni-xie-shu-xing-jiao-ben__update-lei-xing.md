<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-jiao-ben/shou-ba-shou-jiao-ni-xie-shu-xing-jiao-ben/update-lei-xing -->
<!-- Snapshot date: 2026-07-29 -->

# UPDATE 类型

## 属性效果[​](#属性效果 "属性效果的直接链接")

制作一个伤害属性加成的属性，公式为 **"{entityA:物理伤害}\*{value}/100"**

```
var priority = 105
var combatPower = 5.0
var attributeName = "伤害加成"
var attributeType = "UPDATE"
var placeholder = "updateAttribute"

function onLoad(attr){
  /* UPDATE 类型建议将 setSkipFilter 设为 true */
  attr.setSkipFilter(true)
  /* 设置公式 */
  attr.setFormula("\{entityA:物理伤害\}*\{value\}/100")
  return attr
}

function run(attr, entity, handle){
  var value = attr.getRandomValue(entity, handle)
  var additionValue = 0.0
  /* 获取实体 AttributeData 数据 */
  var data = attr.getData(entity, handle)
  /* 清除掉上次增加的属性源,防止属性反复叠加 */
  AttributeAPI.takeSourceAttribute(data, "伤害加成")
  
  if (value > 0){
      /* 获取加成值 */
      var additionValue = attr.getFormulaValue(function(){
      var damageValue = attr.getRandomValue(entity, "物理伤害", handle)
	  return damageValue*value/100
      })
   }

   /* 调用 AttributeAPI 内方法增加属性 */
   AttributeAPI.addSourceAttribute(data, "伤害加成", Arrays.asList("物理伤害: "+additionValue), false)
   return false
}
```
