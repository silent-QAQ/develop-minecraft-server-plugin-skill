# Subtask Coordination

## Contents

- When to split work
- Main-task responsibilities
- Ownership contract
- Child-task prompt
- Handoff and integration

## When To Split Work

Split complex plugins only when child tasks can progress independently. Suitable boundaries are core logic, modern platform, legacy platform, GUI/configuration, persistence/integrations, and verification. Keep tightly coupled edits in one task.

## Main-Task Responsibilities

The main task owns the plan, acceptance criteria, platform matrix, architecture, shared interfaces, dependency versions, file ownership, integration, full build, runtime verification, and final report. Keep at least one useful integration activity local while child tasks run.

## Ownership Contract

Assign each child task an exclusive file or module scope. State which shared files are read-only. Require the child to request a decision before changing public interfaces, build versions, descriptors, shared configuration schemas, or another task's files.

Child tasks must not commit, revert, overwrite, or clean unrelated user work unless explicitly instructed.

## Child-Task Prompt

Fill every placeholder and pass only the context needed for the subtask:

```text
你正在开发 Minecraft 服务端插件的一个独立子任务。

项目目标：
{总体目标和用户可观察行为}

你的负责范围：
{模块、功能、允许修改的文件}

只读或禁止修改范围：
{共享接口、其他任务文件、用户已有修改}

目标平台：
- 默认基线：Paper 1.21
- 现代扩展：{1.21.6+ / 无}
- 旧版扩展：{1.12.2 / 无}
- Folia：{需要 / 不需要}
- Java 与构建工具：{实际版本}

既定接口与依赖：
{公共接口、数据模型、依赖版本、调用关系}

实现要求：
- 遵循现有结构和编码风格
- 不擅自改变公共接口、依赖版本或整体架构
- 配置优先使用 YAML
- YAML 使用 # 中文注释，或使用含义明确的中文配置项
- 1.12.2 使用专用平台代码，不混用现代材料和 API
- Folia 使用正确的实体、区域、全局或异步调度器
- 权限组操作优先使用 LuckPerms API
- 变量优先使用 PlaceholderAPI

验收标准：
{可执行、可观察的完成条件}

验证命令与环境：
{必须运行的测试、构建或服务端场景}

交付时返回：
- 修改文件清单
- 实现内容和关键决策
- 实际运行的验证及结果
- 未解决问题和兼容性限制
- 对共享接口或后续任务的影响
```

## Handoff And Integration

Review every child result against the raw diff and acceptance criteria. Resolve shared-interface changes centrally. Run the combined build and full test matrix after integration; child-task success is not integration evidence. Update the main plan immediately when a handoff is accepted or rejected.
