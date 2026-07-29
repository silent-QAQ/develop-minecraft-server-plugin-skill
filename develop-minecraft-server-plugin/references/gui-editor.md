# Visual Inventory GUI Editor

## Use It Selectively

When a plugin involves a chest/inventory GUI, ask whether the user wants to use the bundled editor before implementing the menu. Do not open it until the user agrees. If declined, continue from written requirements without asking again.

Provide a clickable absolute-path link to `assets/gui-editor/index.html`. When in-app browser control is available, open the file in that browser so the user can work beside the task. It is a static application and requires no build or development server.

## Capabilities

- Search and browse 1,537 item keys generated from the bundled Paper 26.2 registry with fully bundled release textures.
- Use the Common category for glass panes, arrows, barriers, structure blocks, wool, item frames, emeralds, and other frequent items; right-click any library item to add or remove a personal favorite.
- Drag items into slots or select a slot and click an item.
- Switch between a 6x9 or 3x9 chest; both layouts include the player's 3x9 inventory and 9-slot hotbar.
- Move or swap configured items between slots.
- Edit material name, amount, custom model data, role, development note, Lore, glint, unbreakable state, enchantments, attributes, and extra NBT/PDC JSON.
- Undo, redo, clear, and retain drafts in browser local storage.
- Export Chinese YAML, JSON, or a ready-to-submit Codex prompt.

The editor bundles Minecraft 26.2 textures imported from a local release. Item icons use the generated model map. Blocks prefer `textures/block/{id}.png`, then `textures/block/{id}_side.png`, and finally the first texture referenced by the release model definition. `air` intentionally has no visible texture.

## AI Handoff

Prefer a browser handoff that requires no manual file upload:

1. Open the editor in the in-app browser and ask the user to reply when the layout is complete.
2. After the user replies, read `window.MC_GUI_EDITOR_EXPORT("json")` from that same page through browser control.
3. Parse the returned JSON as the requirements artifact and confirm the title, layout, populated slot count, and any unresolved development notes.
4. Save the received artifact into the plugin workspace only when it belongs in the project; otherwise keep it as task input.

This is not a background watcher: wait for the user's completion message before reading the page. If browser control or the bridge is unavailable, use the editor's JSON/YAML download or copy action and ask the user to attach or paste that export. Never scan unrelated files in the user's Downloads directory.

Treat the editor export as a requirements artifact, not as executable plugin configuration unless the project adopts the same schema. Convert every slot role and development note into behavior, validation, permissions, dependencies, and acceptance criteria before coding.

Preserve the exported slot index and semantic role. Validate materials against the actual target: a 26.2 item may need a 1.21 alternative and requires a dedicated material/data mapping for 1.12.2.

When implementing the generated GUI:

1. Confirm the target version and whether player-inventory slots are display-only or interactive.
2. Define click, drag, close, disconnect, and duplicate-action behavior.
3. Convert placeholder, economy, permission, and attribute requirements into provider services.
4. Add Chinese YAML comments or use clear Chinese keys in the final shipped configuration.
5. Test every interaction path on the claimed server platforms.

## Refresh The Item Library

After explicitly updating the local API cache, run:

```powershell
scripts/generate-gui-item-library.ps1
```

The generator reads `ItemTypeKeys.java` from the bundled Paper 26.2 source snapshot and replaces `assets/gui-editor/items.js`. Review the editor against new or removed items after regeneration.

To replace the bundled textures from an extracted Minecraft release, run:

```powershell
scripts/import-gui-textures.ps1 "D:\path\to\assets\minecraft"
```

This copies the complete `textures/item` and `textures/block` directories and rebuilds `icon-map.js` from the release's item/model definitions.
