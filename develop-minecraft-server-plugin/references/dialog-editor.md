# Visual Dialog Editor

## Use It Selectively

Use the bundled editor when a plugin needs a Paper Dialog UI and the user wants to review its structure, inputs, bodies, or actions visually. Do not offer it for the default Paper 1.21 baseline unless the selected server actually exposes the required Dialog API. Do not imply that the Paper 1.21.6 snapshot has the same builder signatures as Paper 26.2.

Provide a clickable absolute-path link to `assets/dialog-editor/index.html`. When in-app browser control is available, open the static file in that browser. It requires no build server and bundles its icon runtime, item registry, icon map, and Minecraft 26.2 textures locally.

## API Scope

The editor targets the bundled Paper 26.2 Experimental Dialog API and models:

- `notice`, `confirmation`, `multi_action`, `dialog_list`, and `server_links` types;
- plain-message and item bodies;
- text, boolean, number-range, and single-option inputs;
- action buttons with no action, command templates, custom-click IDs, static Adventure click events, or Java callback bindings;
- optional full exit actions for the types that support them;
- registered-key or tag sources for Dialog lists.

Server Links entries come from connection data and are represented only as a runtime placeholder. The editor intentionally does not fabricate a link list. Anonymous inline Dialog sets are not modeled; implement those explicitly when a project genuinely needs them.

The bundled Paper `26.2.build.87-stable` snapshot uses Adventure 5.2.0. Static click actions are restricted to that API's complete action set: `open_url`, `open_file`, `run_command`, `suggest_command`, `change_page`, `copy_to_clipboard`, `show_dialog`, and `custom`. The editor validates integer and NamespacedKey payloads where the action requires them.

## Capabilities

- Edit ordered bodies, inputs, actions, and type-specific settings with undo and redo.
- Preview all five Dialog layouts without executing client or server actions.
- Select an item body from the complete shared Minecraft 26.2 item library and local texture map.
- Configure ItemStack-facing requirements such as name, Lore, glint, enchantments, attributes, model data, and extra NBT/components.
- Validate input-key uniqueness, numeric ranges, option entries, type-specific action counts, dimensions, registry keys, and action settings.
- Preserve drafts in browser local storage and export Chinese-keyed YAML, JSON, or a ready-to-submit AI prompt.

The export is a requirements artifact, not a promise that the plugin can load the same schema directly. Convert it into the project's configuration and implementation conventions.

## AI Handoff

Prefer a browser handoff that needs no manual upload:

1. Open the editor and ask the user to reply when the Dialog design is complete.
2. After the reply, read `window.MC_DIALOG_EDITOR_EXPORT("json")` from the same page through browser control.
3. Read `window.MC_DIALOG_EDITOR_VALIDATE()` and resolve every reported issue before implementation.
4. Confirm the target Paper version, Dialog type, body/input counts, action mapping, and unresolved development notes.
5. Save the artifact into the plugin workspace only when the project should retain it.

If browser control is unavailable, use the editor's copy or download action and ask the user to paste or attach that explicit export. Never search unrelated download directories.

## Implement The Export

Before generating Java code:

1. Search the bundled source snapshot for the exact target Paper API. Treat the API as Experimental.
2. Map each exported type to only its valid type-specific fields. Do not carry hidden actions or irrelevant settings across types.
3. Convert component format declarations deliberately and construct item bodies through a validated `ItemStack` adapter.
4. Treat callback bindings as implementation requirements; do not serialize Java lambdas into YAML or JSON.
5. Validate every `DialogResponseView` value again on the server, including key, expected type, range, option membership, permission, balance, cooldown, and current state.
6. Match custom-click identifiers before reading a nullable response. Do not assume the callback `Audience` is a player.
7. Use the correct Folia scheduler when a validated action performs scheduled or region-owned work.
