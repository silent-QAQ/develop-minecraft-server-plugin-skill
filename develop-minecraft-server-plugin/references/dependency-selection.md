# Dependency Selection

## Contents

- TabooLib decision
- AttributePlus
- Economy routing
- Native-value currencies
- Dependency boundaries

## TabooLib Decision

Treat TabooLib as an explicit optional architecture choice during planning. Preserve the choice of an existing project. For a new project, use it when its module system, cross-version abstractions, configuration, commands, database helpers, or platform support materially reduce the requested complexity and the team accepts the framework dependency.

Prefer direct Paper/Bukkit APIs when the plugin is small, requires minimal dependencies, needs transparent platform behavior, or would use only a tiny fraction of TabooLib. Do not mix TabooLib and hand-written infrastructure without a clear boundary.

When selected:

- record the TabooLib version and selected modules in the plan;
- use only necessary modules and follow the chosen version's official project layout;
- keep domain logic independent from framework annotations and global objects where practical;
- verify shading/relocation, bootstrap, plugin descriptor generation, and target compatibility;
- verify Paper, Folia, and legacy behavior independently instead of assuming the abstraction guarantees it.

Use these user-provided references when the local project or cache lacks the required detail:

- https://taboolib.feishu.cn/wiki/ZRkowAVt9iJutKk61ibcfIvqnRe
- https://docs.tabooproject.org/

## AttributePlus

When custom RPG attributes are required, prefer AttributePlus compatibility by default. Put attribute access behind an internal service so the core does not depend on one plugin's item format or API.

- detect the installed API/version and supported attribute naming rules;
- declare hard or soft dependency according to whether the feature can degrade;
- do not edit lore as a substitute for an official API when an API is available;
- preserve unknown third-party metadata when modifying items;
- test recalculation, equipment changes, death, login, reload, and offline data where relevant;
- define a no-provider behavior and avoid fabricating zero values that change game balance.

## Economy Routing

Choose an economy provider by semantics:

| Requirement | Preferred integration |
|---|---|
| One conventional server currency | Vault economy API |
| Several named plugin currencies | VaultUnlock |
| Points commonly sold, awarded, or used as a premium balance | PlayerPoints |
| Experience points, levels, hunger, health, or other vanilla values | Dedicated native-value adapter |

Treat PlayerPoints as the in-game points ledger or premium-balance bridge, not as a payment processor. Real-money checkout, order signatures, refunds, chargebacks, and webhooks require a separate secure payment integration if requested.

For every balance type, define identifier, display name, precision, rounding, minimum/maximum, negative-balance policy, formatting, offline support, and transactional behavior.

## Native-Value Currencies

Do not force vanilla values through Vault. Implement typed adapters for experience points, experience levels, hunger, saturation, health, items, or other requested values. Define whether a transaction consumes total experience or displayed levels; they are not interchangeable.

Perform affordability check and deduction in one controlled operation. Restore state when the paired business operation fails. Schedule player-state access on the correct Paper/Folia entity context.

## Dependency Boundaries

Expose internal interfaces such as `AttributeService`, `CurrencyService`, and `PlaceholderService`. Keep provider-specific objects out of domain models. Fail startup with an actionable message for missing hard dependencies; disable only the affected feature for missing soft dependencies.

Read `plugin-api-handbook.md` before implementation for provider acquisition, common calls, native adapters, official sources, and version-verification rules.
