# Provider guide standard

This guide is for contributors writing or editing provider guides in `src/provider-guides/`.

## Before you start

- Read `CONTRIBUTING.md` for shared writing style.
- Check the provider's catalog key and supported actions before writing claims.
- Use this file as the source of truth when existing guides conflict with it.

## File and provider mapping

Prefer naming the guide file after the provider catalog key, for example `src/provider-guides/hubspot.mdx`.

The drift check resolves a guide to a provider in this order:

1. `provider` in frontmatter
2. `scripts/drift-check/recipes.ts` slug override
3. case-insensitive catalog-key match
4. filename slug

Use `provider` frontmatter or a slug override when the public guide slug and catalog key are different strings. Case-only differences do not need a slug override.

Every guide should include frontmatter with a `title`.

```mdx
---
title: "HubSpot"
---
```

## Supported actions

Only list actions that are supported by the generated connector catalog.

Use these exact links when claiming support. The drift check matches them exactly.

```md
- [Read Actions](/read-actions)
- [Write Actions](/write-actions)
- [Proxy Actions](/proxy-actions)
- [Subscribe Actions](/subscribe-actions)
- [Search Actions](/search-actions)
```

Do not change those link labels to sentence case, such as `[Read actions]`, because the drift check will not detect the claim.

## Deep connector details

For deep connectors:

- Include a supported objects section.
- Link objects to provider documentation when object or schema docs are available.
- State clearly if incremental read is not supported.
- Add a provider-specific sample `amp.yaml` to `amp-labs/samples` and link to it from the guide.

Sample links should use this shape so drift check can validate them:

```md
https://github.com/amp-labs/samples/blob/main/<provider>/amp.yaml
```

## Provider setup

Include enough provider-side setup detail for a developer to complete the integration without guessing.

Cover these when they apply:

- how to create or access a developer app
- required OAuth redirect URLs, scopes, API keys, or secrets
- where to find credentials needed in Ampersand
- free trial, sandbox, developer instance, or test account links
- marketplace listing, app review, admin approval, or publication requirements

Use screenshots or GIFs when setup is visual or multi-step. Capture only the relevant UI and remove private, customer, or internal details.

## Navigation and generated files

Provider guide pages are registered manually in `src/generate-docs.ts`. After editing navigation, regenerate `src/docs.json` with:

```shell
pnpm run gen-docs
```

Do not run the full `pnpm run gen` just to update navigation unless you also intend to refresh generated API reference files.

## Verification

For one provider guide, run:

```shell
pnpm run drift-check -- --mode provider --provider <providerKey> --out /tmp/ampersand-provider-drift
```

CI also runs a PR-scoped drift check for changed provider guides. Running the provider check locally first catches the same class of guide-to-catalog issues before review.

For broad changes, run:

```shell
pnpm run drift-check -- --out /tmp/ampersand-docs-drift
```

The drift check currently enforces:

- undocumented providers
- guides that do not resolve to a catalog entry
- supported-action overclaims
- broken sample links

Other requirements in this guide still need reviewer judgment.
