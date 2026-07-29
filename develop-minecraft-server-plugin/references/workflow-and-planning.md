# Workflow And Planning

## Contents

- Requirement contract
- Plan template
- Confirmation gate
- Complexity classification
- Implementation order
- Change control

## Requirement Contract

Translate the request into observable behavior before coding. Record:

- target server, Minecraft version, Java version, and build tool;
- Paper-only or Paper plus Folia;
- commands, aliases, senders, permissions, and tab completion;
- events, cancellation behavior, priority, and high-frequency paths;
- GUI/Dialog screens, navigation, inputs, conditions, and actions;
- configuration, language, persistence, migration, and reload behavior;
- LuckPerms, PlaceholderAPI, Vault, databases, or other integrations;
- acceptance criteria and explicit exclusions.

Resolve low-risk details conservatively from repository patterns. Ask only when an ambiguity changes architecture, public behavior, data safety, paid/closed dependencies, or deployment.

## Plan Template

Use this structure and keep it current:

```markdown
# 插件开发计划

## 项目目标
## 验收标准
## 目标平台与 Java 版本
## Paper/Folia 支持范围
## 功能清单
## 命令与权限
## GUI/Dialog 设计
## 配置与语言文件
## 数据存储与迁移
## 外部依赖
## 版本兼容策略
## 模块边界与文件所有权
## 实施步骤
## 测试矩阵
## 风险与待确认事项
```

Each implementation step must have a verifiable completion condition. Mark steps as work progresses rather than closing all steps at the end.

## Confirmation Gate

Use this sequence after presenting the initial plan and before editing plugin code:

1. Ask whether requirements or constraints should be added or corrected.
2. Ask whether the baseline implementation should be expanded.
3. Only when expansion is accepted, ask the user to select any required extensions: Paper 1.21.6+ Dialog/UI, Folia scheduling, or an independent Spigot/Bukkit 1.12.2 compatibility implementation.
4. Incorporate the answers into the platform matrix, architecture, implementation steps, tests, risks, and acceptance criteria.
5. Ask for implementation approval, then proceed.

Keep the first confirmation concise. Do not ask three separate platform questions before the user has chosen to expand. Do not ask again for facts already explicit in the request or repository. A narrow fix may use a short plan and a single approval question; an explicit instruction to proceed without confirmation overrides redundant gates.

## Complexity Classification

Treat work as simple when it has one target and one closely scoped behavior. Keep it in the main task with a short plan.

Treat work as medium or complex when any of these apply:

- both 1.21 and 1.12.2 are required;
- both Paper and Folia are required;
- three or more independent feature domains exist;
- database, GUI, permissions, and placeholders interact;
- shared APIs or migrations affect many modules;
- implementation and verification cannot fit reliably in one task context.

Split only independent work. Good child-task boundaries include core domain logic, modern platform adapter, legacy adapter, GUI/configuration, persistence/integrations, and test-server verification.

## Implementation Order

1. Inspect and reproduce the current state.
2. Freeze acceptance criteria and platform matrix.
3. Define shared interfaces only as far as current requirements need.
4. Implement the Paper 1.21 vertical path.
5. Add tests for business rules and the completed path.
6. Add optional Folia, 1.21.6+, and 1.12.2 adapters independently.
7. Run each platform's build and runtime checks.
8. Review configuration usability, migration, and operator errors.
9. Package and report evidence.

## Change Control

Require confirmation before deleting data, changing public APIs, replacing storage formats without migration, adding paid or closed dependencies, raising the minimum server version, or deploying to a live server. Preserve dirty worktree changes and never rewrite unrelated files.
