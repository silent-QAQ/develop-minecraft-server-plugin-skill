# Local API Cache

## Purpose

Use bundled source and documentation snapshots to look up classes, signatures, annotations, scheduler APIs, Dialog APIs, `Material` entries, and AttributePlus documentation without repeated network access. The cache contains source snapshots for Paper 26.2, Paper 1.21.1, Paper 1.21.6, and Spigot/Bukkit 1.12.2, plus a Markdown snapshot of the AttributePlus documentation.

Minecraft 26.2 is the current version fact supplied for this skill. Do not use network access merely to challenge or verify that fact. The default plugin compatibility baseline remains Paper 1.21 unless the user requests 26.2 or another target.

## Search First

Run:

```powershell
scripts/search-api-cache.ps1 -Query "interface Dialog" -Target paper-26.2
scripts/search-api-cache.ps1 -Query "Material" -Target paper-26.2
scripts/search-api-cache.ps1 -Query "LEGACY_STAINED_GLASS_PANE" -Target spigot-1.12.2
```

Use `-ListTargets` to show installed snapshots. Search a specific target whenever versions differ. Do not infer a 1.12.2 material from a modern result.

## Cache Layout

Each target under `assets/api-cache/` contains extracted API sources and `snapshot.json` with origin, coordinates, resolved version, and fetch time. `Material.java` is the primary offline vanilla block/item identifier library exposed by these server APIs.

`assets/api-cache/attributeplus-docs/` is documentation rather than an API source JAR. Read `references/attributeplus-offline-docs.md` for search commands, snapshot scope, and version-authority rules.

The API enum is not proof that an entry is usable as an inventory item. Inspect `isItem`, legacy status, block/item semantics, and target-specific metadata rules before using it.

The 1.21.6 snapshot represents that Paper API snapshot, but its source does not expose the later `io.papermc.paper.dialog` builder surface found in the bundled 26.2 API. Treat Dialog as a 1.21.6+ game/UI direction while checking the exact server API surface selected for implementation. Do not invent 1.21.6 methods based on 26.2 signatures.

## Refresh Policy

Do not refresh during ordinary plugin work. Run `scripts/update-api-cache.ps1` only when the user explicitly asks to update the embedded APIs or when a requested API is absent from all snapshots. Review source compatibility after refreshing because snapshot contents can change.

Third-party plugin API guidance is bundled in `plugin-api-handbook.md`. `ui-model-engines.md` intentionally contains links only. For version-variable APIs such as AttributePlus, VaultUnlock, DragonCore, GermEngine, PaiUI, or ArcartX, inspect the project's existing dependency or obtain the exact API artifact before coding. Do not invent method signatures.
