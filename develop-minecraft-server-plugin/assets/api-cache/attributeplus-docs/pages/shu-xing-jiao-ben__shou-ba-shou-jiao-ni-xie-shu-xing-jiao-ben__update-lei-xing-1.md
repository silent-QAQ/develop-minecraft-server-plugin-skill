<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/shu-xing-jiao-ben/shou-ba-shou-jiao-ni-xie-shu-xing-jiao-ben/update-lei-xing-1 -->
<!-- Snapshot date: 2026-07-29 -->

# CUSTOM 类型

目前插件自带 **3** 种属性触发器，需要 **SkillAPI** 插件支持才可使用：

- `SKILL CAST(技能释放)`
- `SKILL DAMAGE ENTITY(技能攻击非玩家实体)`
- `SKILL DAMAGE PLAYER(技能攻击玩家实体)`

如果你是开发者，那么你可以根据自己的需求，自定义注册更多不同的触发器，只需满足一下条件：

- `所需达成的需求必须有相关的事件支持，否则无法触发`
- `阅读` [`CustomTriggerComponent`](/docs/attributeplus/kai-fa-wen-dang/descriptionlinecondition) `组件开发页面`

```
var priority = 1
var combatPower = 0.0
var attributeName = "技能释放"
var attributeType = "CUSTOM"
var placeholder = "custom_example"

function onLoad(attr){
    //设置自定义触发器名称
    //"SKILL CAST" 玩家释放技能时
    //"SKILL DAMAGE ENTITY" 技能伤害攻击怪物时
    //"SKILL DAAMAGE PLAYER" 技能伤害攻击玩家时
    attr.setCustomTrigger("SKILL CAST")
    return attr
}

//触发 SkillAPI 技能时，输出 SkillAPI 技能名
function runCustom(attr, caster, target, params, source, handle) {
    var name = params[0]
    caster.sendMessage("触发 " + name + " 技能")
    return true
}

//触发 SkillAPI 技能时，当技能名包含在数组内时，输出 SkillAPI 技能名
var skills = ["技能名0", "技能名1", "技能名2"]
function runCustom(attr, caster, target, params, source, handle) {
    var name = params[0]
    //判断此次释放技能是否为数组内技能名
    if (skills.indexOf(name) != -1) {
        caster.sendMessage("触发包含在数组内的 " + name + " 技能")
    }
    return true
}

//触发 SkillAPI 技能时，当技能名包含在数组内时，输出 SkillAPI 技能名
function runCustom(attr, caster, target, params, source, handle) {
    var name = params[0]
    var level = source.getSkill().getLevel()
    if (level >= 3.0) {
        caster.sendMessage("触发了技能等级大于等于3级的技能: " + name)
    }
    return true
}
```
