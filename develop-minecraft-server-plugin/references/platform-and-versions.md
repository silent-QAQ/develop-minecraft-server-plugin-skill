# Platform And Version Rules

## Contents

- Target matrix
- Paper 1.21 baseline
- Paper 1.21.6+ extension
- Folia scheduling
- 1.12.2 legacy implementation
- Packaging strategy

## Target Matrix

Record a matrix before implementation:

| Target | Required | Artifact | Java | Runtime test |
|---|---:|---|---|---|
| Paper 26.2 | Current version, optional target | current | verify project toolchain | Required when claimed |
| Paper 1.21 | Default compatibility baseline | modern | 21 by default | Required |
| Paper 1.21.6+ | Optional | modern or modern-ui | compatible toolchain | Required when claimed |
| Folia | Optional | folia-compatible artifact | matching server | Required when claimed |
| Paper/Spigot 1.12.2 | Optional | legacy | server-compatible | Required when claimed |

Treat Minecraft 26.2 as the known current version supplied by the user. Do not browse merely to verify its existence and do not claim 1.21 is the newest release. Use the bundled local API cache first. Verify exact toolchains or dependency coordinates only when they are missing from the project/cache or when explicitly refreshing dependencies.

## Paper 1.21 Baseline

Use Paper API and Adventure components where available. Keep plugin lifecycle deterministic: construct plain objects first, load and validate configuration, initialize storage, register behavior, then announce readiness. Undo owned resources on disable.

Prefer supported APIs over reflection or NMS. If an existing project targets Spigot API, preserve that constraint unless Paper features are required and the migration is approved.

## Paper 1.21.6+ Extension

Treat Dialog as a UI renderer, not as the domain model. Share action identifiers, conditions, placeholder context, validation, and service calls with inventory GUI implementations. Keep Dialog-specific construction and response handling in a modern adapter.

Feature-detect or separate artifacts when the API cannot be linked safely on the 1.21 baseline. Provide a useful fallback when the product requirements allow it; otherwise reject unsupported startup versions with a precise message.

## Folia Scheduling

Decide Folia support before implementing tasks or mutable state. Expose a small scheduling service with operations such as global, region/location, entity, async, delayed, repeating, and cancel-owned-tasks.

- Use the global-region scheduler only for truly global operations allowed there.
- Use region scheduling for location, chunk, and block ownership.
- Use an entity scheduler for entity-owned work and handle retirement/removal callbacks.
- Use async scheduling only for thread-safe computation and I/O.
- Return to the correct entity or region context before touching server state.
- Never block one region while waiting for another.
- Avoid mutable global collections; use concurrency-safe ownership or explicit coordination.

Do not implement Folia compatibility as a class-name check followed by traditional Bukkit scheduling.

## 1.12.2 Legacy Implementation

Define behavior against 1.21, then implement a dedicated legacy adapter. Share only platform-neutral domain rules, identifiers, configuration schema where sensible, and serialized business data.

Isolate these differences:

- pre-flattening materials and numeric data/durability;
- item metadata, custom model data absence, attributes, and NBT boundaries;
- legacy text colors versus Adventure components;
- sounds, particles, enchantments, entities, events, hands, cooldowns, and combat rules;
- plugin descriptor fields and third-party RPG plugin API versions;
- Java bytecode and library compatibility.

Maintain explicit semantic mappings such as `CONFIRM_BUTTON -> modern material / legacy material+data`. Do not infer mappings by string replacement. Reject unmapped values with a configuration path and an example.

## Packaging Strategy

Prefer separate `modern` and `legacy` JARs when linkage, bytecode, or dependencies differ. A multi-release or reflection-heavy universal JAR is acceptable only when it is simpler to verify and maintain. Name artifacts unambiguously and test the exact distributed files.
