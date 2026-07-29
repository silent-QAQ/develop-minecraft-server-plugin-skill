<!-- Source: https://plugin.hhhhhy.kim/docs/attributeplus/cha-jian-pei-zhi/yu-yan -->
<!-- Snapshot date: 2026-07-29 -->

# 语言

```
mechanism_shield: "&f[&6&l!&f] 盾牌格挡正在冷却中... ({0}ms)"  
equipment_level: "你的等级小于 {0}"  
equipment_permission: "需要职业为 {0}"  
equipment_slot: "需要戴在 {0} 位置"  
equipment_condition: "&f[&6&l!&f] 你身上存在你无法使用的装备,原因可能是 &c{0}"  
  
equipment_slot_type: "§f装备 §6{0} §f只能穿戴在 §6{1} §f位置"  
equipment_professional: "§f装备 §6{0} §f要求玩家职业为 §6{1}"  
equipment_level_not_meet: "§f装备 §6{0} §f要求玩家等级大于等于 §6{1}"  
equipment_level_scope_not_meet: "§f装备 §6{0} §f要求玩家等级 §6{1} ~ {2}"  
  
attack_item_left: "&f[&6&l!&f] 手上物品无法左键进行攻击 (TYPE: {0})"  
attack_item_remote: "&f[&6&l!&f] 手上物品无法造成远程伤害 (TYPE: {0})"  
  
skillapi_exp_addition: "§7+§f{2}§7({0}+{1}) §e经验}"  
  
#书本界面的属性统计相关内容  
stats_head: "  &1&l&n{0} 属性列表"  
stats_attack: "\n     &6&l攻击属性"  
stats_defense: "     &6&l防御属性"  
stats_other: "     &6&l其他属性"  
stats_info:  
  - " "  
  - "          个人信息"  
  - "        战斗力: %ap_combatPower%"  
  
#默认生成的属性标签，修改属性名等请前往 attribute.yml  
#没什么需要请不要修改这里  
attack: "物理伤害"  
pvp_attack: "PVP伤害"  
pve_attack: "PVE伤害"  
accumulate_addition: "蓄力加成"  
accumulate_disturb: "蓄力干扰"  
defense: "物理防御"  
pvp_defense: "PVP防御"  
pve_defense: "PVE防御"  
health: "生命力"  
armor: "护甲值"  
restore: "生命恢复"  
restore_ratio: "百分比恢复"  
crit: "暴击几率"  
crit_rate: "暴伤倍率"  
crit_resist: "暴击抵抗"  
crit_damage_resist: "暴伤抵抗"  
crit_dodge: "暴击闪避"  
vampire: "吸血几率"  
vampire_rate: "吸血倍率"  
vampire_resist: "吸血抵抗"  
vampire_dodge: "吸血闪避"  
reflection: "反弹几率"  
reflection_rate: "反弹倍率"  
fire: "燃烧几率"  
fire_damage: "燃烧伤害"  
dodge: "闪避几率"  
hit: "命中几率"  
frozen: "冰冻几率"  
frozen_intensity: "冰冻强度"  
moving: "移速加成"  
exp_addition: "经验加成"  
lightning: "雷击几率"  
lightning_damage: "雷击伤害"  
real_attack: "真实伤害"  
sunder_armor: "破甲几率"  
see_through: "护甲穿透"  
summon_intensity: "召唤强度"  
shoot_speed: "箭矢速度"  
shoot_spread: "箭术精准"  
shoot_through: "箭矢穿透率"  
break_shield: "破盾几率"  
shield_block: "盾牌格挡率"  
remote_immune: "箭伤免疫率"  
  
shoot_attribute: "&f[&6AttributePlus&f] 当前版本暂不支持 &6弓箭机制 &f对应的属性无法失效"  
  
attribute_read_conflict:  
  - "&f属性读取冲突: &6{0}"  
  - "&f假设服务器有 &3'物理伤害' '伤害' &f标签,那么你使用 &3'物理伤害' &f时会冲突"  
  - "&f因为 &3'物理伤害' &f包含 &3'伤害' &f两个字被判定为两个属性标签,所以会冲突"  
  - ""  
  - "&a&l解决方法: &7请确保任何一个属性标签都是完全不同的，不包含其他属性标签"  
  
register: "&f[&6AttributePlus&f] 正在注册 {0}-{1} 插件内的属性等组件,作者: {2}"  
register_external_attribute: "&f[&6AttributePlus&f] 开始自动加载附属属性等组件..."  
register_external_attribute_over: "&f[&6AttributePlus&f] 共加载了 {0} 个附属插件"  
attribute_register: "&f[&6AttributePlus&f] 属性 [&6{0}&f] 注册完毕"  
priority_attribute_register: "&f[&6AttributePlus&f] 属性 [&6{0}&f]-[&6{1}&f] 注册完毕,优先级为 [&6&l{2}&f]"  
attribute_close: "&f[&6AttributePlus&f] 属性 [&6{0}&f]-[&6{1}&f] 优先级为 &c-1 &f该属性已被禁用"  
attribute_enable_killer: "&f[&6AttributePlus&f] 检测到注册 KILLER 处理类型属性,启用对应事件处理模块"  
attribute_custom_unknown: "&f[&6AttributePlus&f] 注册 §6{0} §f属性时,未在 §6onLoad() §f内调用 §6setCustomTrigger(name) §f设置触发器"  
attribute_custom_error: "&f[&6AttributePlus&f] 注册 §6{0} §f属性时,设置了未知的触发器 §6{1} §7(未注册触发器)"  
register_custom_trigger: "&f[&6AttributePlus&f] 成功注册 §6{0} §f属性触发器,启动相关事件监听"  
  
read_register: "&f[&6AttributePlus&f] 新的读取格式组件 [&6{0}&f] 加载完毕"  
read_unregister: "&f[&6AttributePlus&f] 读取格式组件 [&6{0}&f] 卸载完毕"  
  
script_register: "&f[&6AttributePlus&f] 开始加载插件 JavaScript 属性脚本"  
script_register_over: "&f[&6AttributePlus&f] 共加载了 {0} 个属性脚本"  
script_register_error: "&f[&6AttributePlus&f] [&6{0}&f] §f属性脚本 §6{1} §f方法编写异常"  
script_register_error_text: "&f[&6AttributePlus&f] 异常内容: §7{0}"  
script_exception: "&f[&6AttributePlus&f] &6{0} &f属性脚本异常,脚本内可能没有编写 &3&l{1}&f 方法"  
standby_script_tool: "&f[&6AttributePlus&f] &f找不到 &6StaticClass &f类,已启动备用脚本工具"  
  
plugin_reload: "&f[&6AttributePlus&f] 重载插件!"
```
