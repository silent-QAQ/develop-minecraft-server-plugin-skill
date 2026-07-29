# Skill Index

Use this index to load only the material needed for the current task.

| Need | Read or run |
|---|---|
| Plan a plugin or classify complexity | `workflow-and-planning.md` |
| Split work into child tasks | `subtask-coordination.md` |
| Choose Paper, Folia, 26.2, 1.21.6+, or 1.12.2 strategy | `platform-and-versions.md` |
| Decide whether to use TabooLib | `dependency-selection.md` |
| Add attributes or economy | `dependency-selection.md` |
| Implement AttributePlus, Vault, VaultUnlock, PlayerPoints, native values, LuckPerms, or PlaceholderAPI | `plugin-api-handbook.md`; also read `dependency-selection.md` |
| Look up AttributePlus configuration, reading rules, scripts, components, or API | `attributeplus-offline-docs.md`; search `assets/api-cache/attributeplus-docs/pages/` |
| Integrate DragonCore, GermEngine, PaiUI, or ArcartX | Use `ui-model-engines.md` as an on-demand link index; also read `platform-and-versions.md` |
| Build inventory GUI, Dialog, or YAML configuration | `gui-and-configuration.md` |
| Visually design a configurable inventory GUI | `gui-editor.md`; open `assets/gui-editor/index.html` |
| Visually design a Paper Dialog UI | `dialog-editor.md`; open `assets/dialog-editor/index.html` |
| Compile, test, run a server, or deliver artifacts | `testing-and-delivery.md` |
| Look up Paper/Bukkit classes, methods, or materials offline | `local-api-cache.md`; run `scripts/search-api-cache.ps1` |
| Inspect an existing project | run `scripts/inspect-project.ps1` |
| Review YAML Chinese comments | run `scripts/check-yaml-comments.ps1` |
| Explicitly refresh bundled API snapshots | run `scripts/update-api-cache.ps1` |

## Fast Paths

- Small command/listener change: inspect project, read workflow, platform, and testing references.
- GUI feature: add GUI/configuration references; use the inventory or Dialog editor that matches the target UI when structure or behavior needs user review.
- RPG feature: add dependency-selection and plugin-api-handbook; load local material/API entries for every target.
- Third-party UI/model feature: open only the relevant link from ui-model-engines, then verify the exact installed engine API before coding.
- Multi-version or Folia feature: add platform/version rules and create a test matrix.
- Complex new plugin: read planning and subtask coordination first, then dispatch references by child-task ownership.

Search references with `rg -n "keyword" references` before opening several full files.
