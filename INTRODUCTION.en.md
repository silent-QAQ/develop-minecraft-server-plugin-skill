# AI-Automated Minecraft Server Plugin Development Skill

`develop-minecraft-server-plugin` is a Codex Skill for developing Minecraft Java Edition server plugins. It turns general-purpose AI coding into a planned, modular, verifiable, and maintainable engineering workflow for creating plugins, extending existing projects, fixing defects, migrating across versions, and producing deployable artifacts.

## Purpose

This Skill does not consider a collection of compiling Java files to be a finished plugin. It guides the AI through requirement analysis, technical decisions, implementation planning, coding, configuration design, automated testing, runtime server verification, and delivery reporting.

Every development task starts with a plan. Complex plugins are divided by feature, platform, or verification responsibility, while the main task retains ownership of shared interfaces, file boundaries, integration testing, and final delivery.

## Versions And Platforms

- Treats Minecraft 26.2 as the known current version instead of incorrectly claiming that Minecraft ends at 1.21.
- Uses Paper 1.21 as the default plugin compatibility baseline.
- Supports an optional 1.21.6+ modern UI direction, including Dialog capabilities.
- Optionally supports Folia with the correct entity, region, global, and asynchronous scheduling model.
- Optionally supports the rich 1.12.2 RPG ecosystem through dedicated legacy code for materials, item data, events, and gameplay-rule differences.
- Prefers separate modern and legacy JARs when a universal artifact would require fragile reflection or unsafe compatibility compromises.

## Plugin Ecosystem

- TabooLib is an explicit architectural option and is never introduced automatically.
- Attribute features prefer AttributePlus compatibility by default.
- Conventional single-currency economies prefer Vault.
- Multi-currency systems prefer VaultUnlock.
- Points, premium balances, and commonly purchased credit systems prefer PlayerPoints.
- Native values such as experience points, levels, and hunger use dedicated vanilla-value adapters.
- Permission groups, inheritance, contexts, and temporary permissions prefer the LuckPerms API.
- External and exported placeholders prefer PlaceholderAPI.

Third-party providers are integrated behind internal service boundaries. The Skill requires clear hard-dependency, soft-dependency, and graceful-degradation behavior instead of leaking provider-specific objects into domain logic.

## GUI And Configuration

Operator-facing configuration prefers UTF-8 YAML. Options must either use clear Chinese names or include Chinese comments using YAML's standard `#` syntax. Shipped defaults must start successfully and document relevant ranges, units, defaults, version restrictions, and reload behavior.

Inventory GUIs use a validated model based on character layouts, semantic slots, display conditions, click actions, placeholders, and version-aware materials. For 1.21.6+ Dialog UI, the Skill reuses conditions, actions, and domain services while keeping the renderer separate from inventory implementations.

## Offline API Resources

The Skill includes searchable API source snapshots for:

- Paper 26.2
- Paper 1.21.1
- Paper 1.21.6
- Spigot/Bukkit 1.12.2

The local cache contains Paper/Bukkit types, events, schedulers, item metadata, Dialog APIs, and version-specific `Material` definitions. The AI searches these resources first, avoiding repeated network lookups for basic APIs or unnecessary verification that Minecraft 26.2 exists.

## Quality Assurance

Validation scales with risk and can include configuration checks, compilation, static analysis, unit tests, MockBukkit tests, and disposable Paper or Folia server runs. Every claimed platform must be tested independently; successful compilation is not accepted as proof of runtime compatibility.

Delivery reports identify artifacts, supported versions, Java requirements, dependencies, configuration migrations, tests actually executed, results, and remaining limitations.

## Usage

Invoke the Skill in Codex with a request such as:

```text
Use $develop-minecraft-server-plugin to build a configurable equipment decomposition plugin for Paper 1.21 and Folia with PlaceholderAPI and Vault support.
```

The Skill inspects the project and produces a development plan before editing. It splits complex work into coordinated subtasks when appropriate and uses its index to load only the relevant guidance instead of rereading the complete Skill on every task.
