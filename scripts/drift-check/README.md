# Drift check

Static comparison of provider guides against the connectors catalog. Detects three classes of drift between the docs at `src/provider-guides/` and the catalog at [`amp-labs/connectors/internal/generated/catalog.json`](https://github.com/amp-labs/connectors/blob/main/internal/generated/catalog.json).

## Quick start

```shell
pnpm run drift-check                       # full sweep, default ./drift-report/
pnpm run drift-check -- --out /tmp/out     # custom output directory
pnpm run drift-check -- --mode provider --provider hubspot
pnpm run drift-check -- --fail-on-error    # exit non-zero on any error finding
```

Both `pnpm run drift-check --out X` and `pnpm run drift-check -- --out X` work. The script writes two files to the output directory:

- `drift-report.json`: canonical findings, one object per finding.
- `drift-report.md`: human-readable rollup grouped by severity.

## What it checks

| Kind | Severity | What triggers it |
|---|---|---|
| `undocumented-provider` | error | Catalog has a provider; no guide exists; no allowance in `recipes.ts` |
| `undocumented-provider-allowance-expired` | warning | An entry in `undocumentedAllowed` has passed its `until` date |
| `guide-without-catalog-entry` | error | A guide resolves to a catalog key that does not exist |
| `doc-overclaims-{read,write,subscribe,proxy,search}` | error | Guide claims an action; neither provider-level nor any module-level support flag is true |
| `broken-sample-link` | error | Guide links to a `samples` manifest that 404s |

The check is **module-aware**: a guide claim is considered valid if either the provider-level flag is true *or* any module-level flag is true. So Google's `subscribe` claim is valid because `modules.gmail.support.subscribe == true`, even though `support.subscribe == false` at the provider level.

For multi-module providers, findings include `"module": "all"` since the v1 detector does not attempt to attribute the claim to a specific module.

## Modes

- **`--mode full`** (default): scan every guide and check every catalog provider for missing docs.
- **`--mode per-pr --changed <path>...`**: scan only the listed `.mdx` files. Skips the undocumented-provider check (it requires a global view). Suitable for per-PR CI where you only want to validate touched files.
- **`--mode provider --provider <catalogKey>`**: scan only the guide that resolves to the given catalog key. Useful for guide authors iterating locally.

## Resolving guide slug to catalog key

Guides resolve to a catalog key in this order:

1. Frontmatter `provider` field, case preserved.
2. `slugOverrides` in `recipes.ts` (for genuine name differences, not case).
3. Case-insensitive match against catalog keys (handles `aweber.mdx` → `aWeber`).
4. Filename slug, verbatim (fails as `guide-without-catalog-entry` if no catalog entry).

This means most case differences between filenames and catalog keys (73 of 227 catalog keys are mixed-case) need no recipe at all.

## Adding a recipe

Edit `recipes.ts`. Two surfaces:

### `slugOverrides`

Use only when the filename slug and the catalog key are genuinely different strings, not just case differences. Examples:

```ts
slugOverrides: {
  instantly: 'instantlyAI',                    // file documents the V2 catalog entry
  'google-workspace-delegation': 'googleWorkspaceDelegation',  // hyphen vs camelCase
  jira: 'atlassian',                           // alias guide for a family
}
```

### `undocumentedAllowed`

Use when a catalog entry intentionally has no guide. Every allowance has a reason and an `until` date so it cannot persist forever.

```ts
undocumentedAllowed: [
  {
    provider: 'instantly',
    reason: 'Legacy V1 connector; current public guide covers instantlyAI.',
    until: '2026-09-01',
  },
]
```

When `until` passes, the entry becomes a warning (`undocumented-provider-allowance-expired`) until renewed or removed.

## What v1 deliberately does not check

These are out of scope for v1. PR 3 or later may add them.

- **Object-name drift between guides and connector source.** The connector source under `providers/<slug>/` enumerates supported objects; v1 does not parse Go.
- **Provider public-doc drift.** Comparing each guide's setup steps against the provider's own developer documentation requires per-provider HTML parsing.
- **Provider product-UI drift.** Validating screenshots and GIFs against the actual provider dashboards requires real accounts, MFA, and is explicitly out of scope.
- **Runtime smoke tests.** Actually exercising read/write/proxy against a live provider requires sandbox accounts and is a separate program.

## Severity → CI behavior

When wired into CI (PR 3), the intended mapping:

- **error**: fails CI when the change is on a touched file (per-PR mode).
- **warning**: reported, never fails CI.
- **info**: reported, never fails CI.

The script accepts `--fail-on-error` for the CI invocation.

## Files

| File | Purpose |
|---|---|
| `index.ts` | CLI entry; orchestrates the three checks |
| `catalog.ts` | Fetch `catalog.json`; module-aware capability helpers |
| `docs.ts` | Scan `.mdx` files; extract frontmatter and the five action-link patterns |
| `samples.ts` | HEAD-check each sample manifest URL |
| `recipes.ts` | `slugOverrides` and `undocumentedAllowed` |
| `report.ts` | Finding type, JSON canonical output, Markdown rollup |
