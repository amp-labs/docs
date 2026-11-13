# Drift check

Compares provider-guide claims against the generated [`amp-labs/connectors`](https://github.com/amp-labs/connectors/blob/main/internal/generated/catalog.json) catalog. Static, no credentials, no runtime calls.

## Quick start

```shell
pnpm run drift-check                         # full sweep, default ./drift-report/
pnpm run drift-check -- --out /tmp/out       # custom output directory
pnpm run drift-check -- --mode provider --provider hubspot
pnpm run drift-check -- --fail-on-error      # exit non-zero on any error finding
pnpm run drift-check -- --mode per-pr --changed-from "$BASE_SHA" --changed-to "$HEAD_SHA"
pnpm run test:drift-check                    # run the parser tests
```

Both `--out X` and `-- --out X` (the pnpm forwarding form) work. Output is written to `drift-report.json` (canonical) and `drift-report.md` (human-readable rollup).

## How a guide maps to a provider

Each guide resolves to a catalog key, in this order:

1. `provider` in the guide's frontmatter
2. `slugOverrides` in `recipes.ts`
3. A case-insensitive match between the filename and a catalog key
4. The filename as is

Name the guide after its catalog key. When the two are different strings (not just different case), set `provider` in the frontmatter.

## Modes

- `full` (default): scan every guide; run the undocumented-provider check.
- `per-pr`: scan only changed `.mdx` files; skips the undocumented check (needs a global view). Pass the set as `--changed <path>...`, or as a commit range with `--changed-from <sha> --changed-to <sha>` (resolved via `git diff`, failing closed if the range cannot be computed).
- `provider --provider <catalogKey>`: scan a single guide. Useful while iterating.

## Finding types

| Kind | Severity | Triggers |
|---|---|---|
| `undocumented-provider` | error | Catalog has a provider; no guide; no allowance |
| `undocumented-provider-allowance-expired` | warning | An entry in `undocumentedAllowed` has passed its `until` date |
| `undocumented-provider-allowance-unneeded` | warning | An entry in `undocumentedAllowed` now has a guide |
| `guide-without-catalog-entry` | error | A guide resolves to a catalog key that does not exist |
| `doc-overclaims-{read,write,subscribe,proxy,search}` | error | Guide links to an action page under "Supported actions"; neither provider-level nor any module-level support flag is true |
| `broken-sample-link` | error | Guide links to a `samples` manifest that 404s |

Module-aware: a claim is valid if either the provider-level flag is true *or* any module-level flag is true. Multi-module provider findings carry `"module": "all"` since v1 does not attribute the claim to a specific module.

## What this does not prove

This check uses the generated connectors catalog from `main`. It does **not** validate the deployed `/v1/providers` API against its declared shape, and it does **not** prove that read/write/proxy/subscribe calls succeed at runtime. Several drift surfaces are deliberately out of scope:

| Surface | Why out of scope |
|---|---|
| Connector Go source vs generated catalog | Regeneration lag; lives in the connectors repo |
| Generated catalog vs live `/v1/providers` | Deployment lag; separate cheap check |
| Live API declared shape vs runtime behavior | Requires sandbox accounts; separate program |
| Guides vs connector source object names | Requires parsing Go; deferred to a follow-up PR |
| Guides vs provider's own developer docs | Per-provider HTML parsing |
| Guides vs provider product UIs (screenshots, GIFs) | Manual surface; account + MFA |

## Adding a recipe

Edit `recipes.ts`. Two surfaces, both intentionally sparse.

**`slugOverrides`** — when the filename slug and the catalog key are different *strings* (not just different cases — case differences are handled automatically):

```ts
slugOverrides: {
  instantly: 'instantlyAI',
  jira: 'atlassian',
}
```

**`undocumentedAllowed`** — when a catalog entry intentionally has no guide. Every entry needs a reason and a time-bounded `until` so the allowance cannot persist forever:

```ts
{ provider: 'adyenTest', reason: 'Internal test variant.', until: '2027-01-01' }
```

When `until` passes, the entry becomes an `undocumented-provider-allowance-expired` warning until renewed or removed.
