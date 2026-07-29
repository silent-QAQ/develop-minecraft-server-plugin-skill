# develop-minecraft-server-plugin-skill

面向 Minecraft Java 服务端插件开发的 Codex Skill。它将需求分析、版本策略、第三方 API 适配、GUI 配置、测试验证和交付整理成一套可重复的工作流。

## 适用范围

- Paper 1.21 默认开发基线
- Minecraft 26.2 API 参考
- Paper 1.21.6+ Dialog/UI 扩展
- 可选 Folia 调度模型
- 独立的 Spigot/Bukkit 1.12.2 兼容实现
- Bukkit/Paper 插件的创建、扩展、迁移、调试、测试和打包

## 集成优先级

Skill 默认按业务语义选择第三方 API：

| 能力 | 优先 API |
|---|---|
| RPG/自定义属性 | AttributePlus |
| 普通单货币经济 | Vault |
| 多货币经济 | VaultUnlock |
| 点券、充值积分、高级余额 | PlayerPoints |
| 经验、等级、饥饿度、生命值等原版数值 | 独立原版数值适配器 |
| 权限组、继承、临时权限 | LuckPerms API |
| 外部变量解析、插件变量输出 | PlaceholderAPI |

所有第三方对象都应通过内部服务边界接入，避免业务代码直接绑定供应商实现。

## UI/模型引擎文档

这些引擎文档较大且版本变化快，Skill 只提供按需链接，不预加载或复制完整文档：

- 1.12.2 龙核、龙之核心新/旧 Wiki、萌芽：`develop-minecraft-server-plugin/references/ui-model-engines.md`
- 高版本 PaiUI、ArcartX：同上

只有在用户明确提出对应引擎时，才打开匹配版本的官方文档并核对实际安装 JAR，禁止凭印象编造方法签名。

## 使用

将 `develop-minecraft-server-plugin` 安装到 Codex 的 skills 目录，然后在 Codex 中调用：

```text
使用 $develop-minecraft-server-plugin 开发一个支持 Paper 1.21 和 Vault 的插件。
```

Skill 会先检查项目和本地 API 缓存，再制定版本、依赖、模块、测试和交付计划。

## 文档导航

- `SKILL.md`：主工作流与触发规则
- `references/index.md`：按任务选择参考文档
- `references/plugin-api-handbook.md`：第三方插件 API 速查与适配边界
- `references/ui-model-engines.md`：第三方 UI/模型引擎官方链接索引
- `references/platform-and-versions.md`：Paper、Folia、1.12.2 和跨版本策略
- `references/testing-and-delivery.md`：验证、运行和交付要求
- `assets/api-cache/`：Paper/Bukkit 离线 API 源码快照

## 许可证

本项目许可证见 [LICENSE](LICENSE)。仓库内第三方 API 文档和链接仍以其各自项目的许可证与使用条款为准。
