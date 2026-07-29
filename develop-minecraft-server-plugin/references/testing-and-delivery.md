# Testing And Delivery

## Contents

- Test matrix
- Static and unit checks
- Runtime checks
- GUI and concurrency checks
- Delivery report

## Test Matrix

Create a row for every claimed artifact and server combination. Record Java, server build, dependencies, configuration fixture, command used, and result. Do not substitute Paper runtime tests for Folia or 1.12.2 tests.

## Static And Unit Checks

- Parse plugin descriptors and shipped YAML.
- Check configuration examples with `scripts/check-yaml-comments.ps1` and manually review exceptions.
- Run the repository's formatter, compiler, static analysis, and complete test suite.
- Unit-test platform-neutral rules, parsers, migrations, mappings, and transactional decisions.
- Use MockBukkit when it supports the exercised API; do not use a mock result as proof of unsupported modern or Folia behavior.

## Runtime Checks

Start a disposable server matching each target. Accept required licenses intentionally and keep test data outside production paths. Verify:

1. clean first startup and generated files;
2. enable without warnings or stack traces;
3. commands from players and console, permissions, completion, and invalid arguments;
4. relevant events and cancellation behavior;
5. persistence across restart;
6. supported reload behavior;
7. clean disable with no leaked tasks, threads, connections, or inventory loss.

Capture concise logs and exact server builds as evidence.

## GUI And Concurrency Checks

Test all click modes, drag, close, disconnect, full inventory, insufficient currency/items, duplicate rapid clicks, pagination, placeholder refresh, and invalid configuration. Verify rollback when an operation fails midway.

For Folia, exercise players/entities in different regions and teleport/removal during scheduled work. Look for illegal thread-access warnings, deadlocks, stale entity ownership, and global mutable state races.

## Delivery Report

Report:

- artifact paths and checksums when useful;
- supported server and Java versions;
- required and optional dependencies;
- configuration and migration notes;
- commands and permissions added or changed;
- tests and runtime scenarios actually executed;
- failures fixed during verification;
- untested claims, remaining limitations, and operator actions.

Never say “fully compatible” when a target was not started and exercised.
