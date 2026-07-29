# Plugin API Handbook

Use this handbook when implementing attributes, balances, permissions, or placeholders. It is an offline calling guide, not a substitute for checking the exact dependency version selected by the project.

## Contents

- Selection order
- Shared adapter contract
- AttributePlus
- Vault
- VaultUnlock
- PlayerPoints
- Native player values
- LuckPerms
- PlaceholderAPI
- Dependency and verification checklist

## Selection Order

Choose by the meaning of the value, not by whichever plugin is already familiar:

| Need | Default provider |
|---|---|
| RPG/custom attributes | AttributePlus |
| One ordinary currency | Vault |
| Several named currencies | VaultUnlock |
| Points, recharge credits, or premium balance | PlayerPoints |
| Experience, levels, food, saturation, health, or items | Dedicated Bukkit/Paper native adapter |
| Groups, inheritance, contexts, or temporary permissions | LuckPerms API |
| Parse third-party variables or export plugin variables | PlaceholderAPI |

These are defaults, not permission to add every dependency. Confirm server version, installed provider/version, whether the feature is required, and the desired missing-provider behavior during planning.

## Shared Adapter Contract

Keep provider types outside domain code. Prefer small interfaces such as:

```java
public interface CurrencyService {
    BalanceResult balance(UUID playerId, String currency);
    TransactionResult withdraw(UUID playerId, String currency, BigDecimal amount);
    TransactionResult deposit(UUID playerId, String currency, BigDecimal amount);
}
```

Return an explicit unavailable/error result instead of fabricating a zero balance. Define precision, rounding, negative-balance policy, offline-player support, and whether the provider makes check-and-withdraw atomic. If it does not, serialize plugin-originated transactions per account and compensate the paired business operation on failure.

## AttributePlus

Prefer AttributePlus when the request needs custom RPG attributes. AttributePlus distributions and APIs differ across server generations; there is no safe universal method signature to memorize.

1. Search the bundled official-documentation snapshot described in `attributeplus-offline-docs.md`.
2. Inspect the installed AttributePlus JAR, its bundled API, the project's existing dependency, and its plugin version before coding.
3. Locate public API entry points with `jar tf AttributePlus*.jar` and `javap`, or use sources/Javadocs supplied with that exact release.
4. Record the verified classes and signatures in the implementation plan.
5. Wrap reads, temporary modifiers, item parsing, and recalculation behind `AttributeService`.
6. Use official recalculation/update hooks. Do not edit lore or internal NBT as an API substitute.
7. Preserve unknown metadata and test login, equipment changes, death, reload, and provider absence.

Official documentation: <https://plugin.hhhhhy.kim/docs/attributeplus>.

Never copy an AttributePlus signature from a different major release merely because the class name looks similar.

## Vault

Vault is an abstraction API; a separate economy provider must be installed. Resolve the registered service after plugins are enabled:

```java
RegisteredServiceProvider<Economy> registration =
        getServer().getServicesManager().getRegistration(Economy.class);
if (registration == null) {
    // Disable the economy feature or fail startup according to dependency policy.
    return;
}
Economy economy = registration.getProvider();
```

Common calls are `hasAccount`, `getBalance`, `has`, `withdrawPlayer`, and `depositPlayer`. Always inspect `EconomyResponse#transactionSuccess()` and report `errorMessage` on failure. Use the overloads appropriate to the selected Vault API and provider; world-aware balances are not interchangeable with global balances.

Typical metadata:

```yaml
softdepend: [Vault]
```

Use a compile-only/provided API dependency and do not shade Vault into the plugin. Official sources: <https://github.com/MilkBowl/VaultAPI> and <https://github.com/MilkBowl/Vault>.

## VaultUnlock

Use VaultUnlock for several named currencies only after confirming the installed release and its currency identifier rules. VaultUnlock is not interchangeable with Vault's single `Economy` service and may expose version-specific registries or account APIs.

1. Inspect the exact server JAR/API artifact and official documentation.
2. Verify currency discovery, identifier casing, decimal precision, offline support, and transaction result types.
3. Put the verified calls behind `CurrencyService`; never make domain code depend on VaultUnlock objects.
4. Test unknown currency IDs, provider reload, concurrent purchases, insufficient funds, and partial failure.

Do not invent a VaultUnlock Maven coordinate or method signature. If the artifact is not public, use the user/server-provided API JAR as a local `compileOnly` dependency and document how CI obtains it without committing proprietary binaries.

## PlayerPoints

Obtain the API from the installed plugin rather than constructing it:

```java
Plugin plugin = getServer().getPluginManager().getPlugin("PlayerPoints");
if (!(plugin instanceof PlayerPoints playerPoints) || !plugin.isEnabled()) {
    return;
}
PlayerPointsAPI points = playerPoints.getAPI();
```

The maintained API uses UUID accounts and exposes operations such as `look`, `take`, `give`, and `set`; check the exact selected version for return types and constraints before implementing rollback logic. Prefer `take`/`give` over read-then-set. Treat these points as an in-game ledger, not a real-money payment processor.

```yaml
softdepend: [PlayerPoints]
```

Official source and API class: <https://github.com/Rosewood-Development/PlayerPoints> and <https://github.com/Rosewood-Development/PlayerPoints/blob/master/src/main/java/org/black_ixx/playerpoints/PlayerPointsAPI.java>.

## Native Player Values

Use a separate typed adapter for every vanilla value. Do not route them through Vault.

- Experience points: define total accumulated XP semantics and use Bukkit/Paper experience APIs or a tested total-XP utility for the target version.
- Experience levels: use `Player#getLevel`/`setLevel`; levels are nonlinear and are not raw XP.
- Food and saturation: use `getFoodLevel`/`setFoodLevel` and `getSaturation`/`setSaturation`; clamp to platform-valid ranges.
- Health: respect `Attribute.GENERIC_MAX_HEALTH` or the target-version equivalent, current max health, absorption, and death rules.
- Items: match the requested identity rules explicitly, including material, amount, custom model data, components/meta, enchantments, and third-party tags.

Read and mutate player state on the correct entity scheduler when Folia is enabled. Validate affordability and deduction in one scheduled operation, then restore state if the associated purchase/action fails.

## LuckPerms

Resolve the API through Bukkit's service manager:

```java
RegisteredServiceProvider<LuckPerms> registration =
        Bukkit.getServicesManager().getRegistration(LuckPerms.class);
LuckPerms luckPerms = registration == null ? null : registration.getProvider();
```

Use ordinary `Player#hasPermission` for simple checks. For mutation, load/find a `User`, add or remove typed nodes such as `PermissionNode`, `InheritanceNode`, or their temporary/contextual variants, inspect `DataMutateResult`, then persist through `UserManager#saveUser`. Never block a server or region thread on asynchronous user loading.

Use the official repository and wiki to verify the selected API: <https://github.com/LuckPerms/LuckPerms> and <https://luckperms.net/wiki/Developer-API>.

## PlaceholderAPI

Parse text only when PlaceholderAPI is present:

```java
String rendered = PlaceholderAPI.setPlaceholders(player, input);
```

Export plugin variables with a `PlaceholderExpansion`. Give the expansion a stable identifier, implement null/offline behavior, validate parameters, and register/unregister it with the plugin lifecycle. Do not parse unchanged menus every tick; cache expensive underlying data rather than blindly caching player-specific rendered strings.

```yaml
softdepend: [PlaceholderAPI]
```

Official source and developer wiki: <https://github.com/PlaceholderAPI/PlaceholderAPI> and <https://wiki.placeholderapi.com/developers/creating-a-placeholderexpansion/>.

## Dependency And Verification Checklist

- Verify coordinates and versions from the exact provider's official source or supplied API artifact.
- Use `compileOnly`/`provided` for server-installed APIs unless the provider explicitly requires shading.
- Declare `depend`, `softdepend`, or Paper dependency metadata consistently with startup behavior.
- Resolve providers after dependency enablement; release listeners, expansions, and cached references on disable.
- Test with the provider present, absent, disabled, and at every claimed compatible version.
- Test failure results, unknown accounts/currencies, offline users, reload policy, and concurrent transactions.
- Never claim compatibility from compilation alone.
