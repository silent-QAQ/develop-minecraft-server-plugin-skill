# GUI And Configuration

## Contents

- YAML language rules
- Validation and migration
- Inventory GUI schema
- Interaction safety
- Dialog UI
- Versioned materials

## YAML Language Rules

Prefer `.yml` for operator-facing configuration. YAML comments use `#`; never emit bare `//` comments. Use UTF-8 and Chinese operator-facing text.

Every non-self-explanatory option must have a nearby Chinese comment. A clear Chinese key and value may be self-explanatory, but still document units, ranges, defaults, side effects, supported enum values, reload behavior, and version restrictions where applicable.

Example:

```yaml
# 配置结构版本，用于自动迁移，请勿手动修改
配置版本: 1

界面:
  # 界面标题，支持 PlaceholderAPI 变量和颜色代码
  标题: "&8装备分解"

  # 界面行数，可填写 1 至 6
  行数: 6

  # 是否阻止玩家使用 Shift 快速移动物品
  禁止Shift点击: true
```

Quote values that could be parsed as booleans, numbers, dates, or YAML syntax. Avoid aliases and clever YAML features that make configuration harder for operators.

## Validation And Migration

- Ship a complete configuration that starts successfully without editing.
- Validate all paths before enabling dependent features.
- Report the file, full path, invalid value, reason, accepted range, and example.
- Add missing defaults without overwriting user values.
- Store a configuration schema version and migrate forward with backups when data loss is possible.
- State which settings reload safely and which require restart.
- Do not expose secrets in example files or logs.

## Inventory GUI Schema

Use a character layout plus semantic component definitions for configurable GUIs. Keep labels flexible, but model these concepts:

```yaml
界面:
  # 标题支持 PlaceholderAPI 变量
  标题: "&8装备分解"
  行数: 6
  禁止双击: true
  禁止Shift点击: true

  布局:
    - "BBBBBBBBB"
    - "BIIIIIIIB"
    - "BIIIIIIIB"
    - "BIIIIIIIB"
    - "BIIIIIIIB"
    - "BBBBBBBBC"

  元素:
    B:
      作用: "装饰"
      材质: "BLACK_STAINED_GLASS_PANE"
      名称: " "
    I:
      作用: "输入槽位"
    C:
      作用: "确认按钮"
      材质: "NETHER_STAR"
      名称: "&a确认分解"
      描述:
        - "&7预计获得：%example_reward%"
      点击动作:
        左键:
          - "执行分解"
```

Support opening/display conditions, permissions, placeholders, actions, navigation, pagination, refresh policy, close behavior, and typed semantic slots as requirements demand. Validate layout width, row count, duplicate semantic roles, missing characters, invalid materials, and unknown actions at startup.

This schema is inspired by configurable Chinese-server menu patterns such as RedmiDecompose, RedmiGem, and PlayerMenu. Treat those pages as design references, not runtime dependencies or schemas to copy blindly:

- http://m3.pulidc.com:8888/plugin/RedmiDecompose/%E6%8F%92%E4%BB%B6%E9%85%8D%E7%BD%AE/%E5%88%86%E8%A7%A3%E7%95%8C%E9%9D%A2%E9%85%8D%E7%BD%AE.html
- http://m3.pulidc.com:8888/plugin/RedmiGem/%E6%8F%92%E4%BB%B6%E9%85%8D%E7%BD%AE/%E7%95%8C%E9%9D%A2%E5%9F%BA%E7%A1%80%E9%85%8D%E7%BD%AE.html
- https://ricedoc.handyplus.cn/wiki/PlayerMenu/example/

## Interaction Safety

Cancel or allow clicks by explicit slot role and inventory ownership, not only by title. Handle number keys, double-click, drag, shift-click, collect-to-cursor, offhand, close, disconnect, death, and plugin disable when inventory contents or currency can be lost. Make transactional actions idempotent and prevent rapid duplicate execution.

## Dialog UI

For the 1.21.6+ Dialog direction, map the same semantic actions, conditions, placeholders, and validation into a Dialog-specific renderer. Check the exact selected Paper API locally because the bundled 1.21.6 snapshot does not expose the later builder API present in Paper 26.2. Do not pretend every inventory interaction has an equivalent Dialog control or copy 26.2 signatures into a 1.21.6 target. Define an intentional fallback or make the exact minimum server/API version explicit.

## Versioned Materials

Allow a semantic item to select modern and legacy representations separately. For 1.12.2, support material plus legacy data/durability where needed. Validate against the selected platform and never silently substitute a materially different item.
