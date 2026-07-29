# Integrations

## Contents

- Dependency policy
- LuckPerms
- PlaceholderAPI
- Integration testing

## Dependency Policy

Use the narrowest stable public API. Verify current coordinates and compatibility from official documentation. Declare hard dependencies only when the plugin cannot function without them; otherwise use soft dependencies and disable only the dependent feature with a clear message.

Read `dependency-selection.md` before choosing TabooLib, AttributePlus, Vault, VaultUnlock, PlayerPoints, or native-value currency adapters.

Read `plugin-api-handbook.md` for the offline API calling guide and official source links. This file retains behavioral policy; the handbook owns implementation-oriented snippets.

## LuckPerms

Use standard Bukkit permission checks for ordinary `hasPermission` behavior. Use LuckPerms API when reading or changing groups, inheritance, contexts, meta, or temporary permission nodes.

- Obtain the API from the service manager.
- Respect LuckPerms asynchronous loading and mutation operations.
- Never block a server or Folia region thread waiting for storage.
- Save mutations through supported user-management APIs.
- Define behavior when the user is offline or LuckPerms is unavailable.
- Keep permission node names stable, lowercase, documented, and registered where the platform expects it.
- Do not grant operator status as a substitute for permissions.

## PlaceholderAPI

Use PlaceholderAPI for resolving third-party placeholders and for exporting plugin placeholders.

- Wrap parsing behind a placeholder service so behavior is testable and optional.
- Register a dedicated expansion when exporting values.
- Define placeholder identifiers, input parameters, null behavior, offline-player behavior, and formatting.
- Cache expensive values with an explicit invalidation or lifetime policy.
- Do not parse large menus every tick.
- Resolve placeholders in the correct player context and return to a safe scheduler context before updating UI.
- Preserve literal text or use a documented fallback when PlaceholderAPI is absent.

## Integration Testing

Test startup both with and without every soft dependency. For hard dependencies, test the missing-dependency failure message. Test LuckPerms operations against a disposable store and verify persistence. Test PlaceholderAPI placeholders for online, offline, missing, malformed, and nested values where relevant.
