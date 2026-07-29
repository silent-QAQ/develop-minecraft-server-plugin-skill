# Visual GUI Editor

## Use It Selectively

Offer the bundled editor when a plugin needs an operator-editable GUI, a ready-to-use default menu, or a visual layout that should be reviewed before implementation. Do not require it for plugins without an inventory GUI or for small fixed menus that the user wants implemented directly.

Open `assets/gui-editor/index.html` in a browser. It is a static application and requires no build or development server.

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
