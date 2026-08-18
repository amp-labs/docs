---
name: writing-provider-guides
description: Use when creating or updating an Ampersand provider (connector) guide in src/provider-guides/ — adding a new connector doc, extending an existing guide with deep connector support (Read/Write/Subscribe), or fixing a guide's structure, headings, or wording.
---

# Writing Provider Guides

## Overview

Every provider guide in `src/provider-guides/*.mdx` follows one canonical structure with exact, fixed wording. Older guides drifted (title-case headings, unlinked object names, paraphrased sentences) — never imitate an arbitrary existing guide. Copy sentences from [templates.md](templates.md) **verbatim** and fill only the `<angle-bracket>` slots.

**Core principle: the guide is assembled from fixed templates, not written.** Your judgment goes into gathering accurate provider facts, not into phrasing.

## Workflow

1. **Gather required inputs.** Ask the user for any of these you cannot derive:
   - Provider display name + slug (slug = folder/file name in the [amp-labs/connectors](https://github.com/amp-labs/connectors) repo, and the mdx filename)
   - Connector type: proxy-only or deep
   - Auth type: `oauth2_authorization_code` | `oauth2_client_credentials` | `api_key` | `basic_auth` | custom
   - Capabilities: subset of read / write / subscribe / proxy
   - Base URL (preserve placeholders like `{{.workspace}}`)

   Optional (proceed with `<!-- TODO: ... -->` comments if missing): object lists + upstream API reference URLs, dynamic-token explanations, credential-creation steps, screenshots.

2. **Inspect the connectors repo** to confirm/derive the inputs — see "Data gathering" in templates.md. Never fabricate objects, scopes, endpoints, or URLs; prefer a TODO comment over a guess.

3. **Classify the incremental-read pattern** (A: none, B: ≤5 objects, C: all, D: >5 objects) — this selects the exact Read Actions sentence. Only claim incremental support with evidence from code; otherwise use Pattern A plus a TODO.

4. **Assemble the MDX** in the canonical section order from templates.md, choosing the auth-type variants. For **updates to an existing guide**: bring headings/wording of the sections you touch up to the canonical templates; keep factual content (credential steps, screenshots) as-is; move any non-template sections (e.g. "API documentation", "Rate limits") to the end of the file unchanged.

5. **Register navigation** (new guides only): add `"provider-guides/<slug>"` to the "Provider guides" group in `src/generate-docs.ts`, keeping the list alphabetically sorted case-insensitively. Then run `pnpm run gen` (or tell the user to).

6. **Run the verification checklist** below before declaring the guide done.

## Non-negotiable rules

- **Every object bullet is a markdown link**: `- [<objectName>](<upstream API reference URL>)`. If no URL is found after searching the provider's API docs, write `- <objectName> <!-- TODO: Add API reference link -->`. A bare object name with no link and no TODO is a defect.
- **Headings are exact strings** from templates.md — sentence case (`## What's supported`, `### Supported actions`, `## Before you get started`), never title case.
- **Action bullet order**: Read → Subscribe → Write → Proxy. Only supported actions appear. Each bullet ends with a period. The Proxy bullet always carries the base URL in backticks.
- **Fixed URLs**: Ampersand OAuth redirect `https://api.withampersand.com/callbacks/v1/oauth`; dashboard `https://dashboard.withampersand.com`; samples `https://github.com/amp-labs/samples/blob/main/<slug>/amp.yaml`.
- **Example integration is conditional on an observable fact**: if the samples-repo `amp.yaml` for the slug exists (check with `curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/amp-labs/samples/main/<slug>/amp.yaml` → 200), use the one-line samples-link template; otherwise use the inline-manifest template. Never emit a samples link you haven't verified.
- **Each dynamic token** (`{{.workspace}}`, `{{.region}}`, …) is explained once under "Before you get started": what it is and where the customer finds it.
- Inline code (backticks) for object names, field names, tokens, and URLs-as-values; `[text](url)` for every navigable link — no raw URLs in prose.
- Imperative voice ("Create…", "Click…"); no future tense; "GitHub" spelled with capital H.
- For deep connectors, treat Read and Write as enabled when implementation files exist in `providers/<slug>/`, even if `Support` flags in the catalog say otherwise.

## Verification checklist (run every time)

```bash
F=src/provider-guides/<slug>.mdx
grep -n "^#" $F                      # headings match templates.md exactly (sentence case)
sed -n '/### Supported objects/,/### Example integration/p' $F | grep "^- " | grep -v "\[.*\](" | grep -v "TODO"   # unlinked object bullets — must output nothing
grep -n "Proxy Actions" $F           # base URL present in backticks
grep -c "{{\." $F                    # every token also explained in Before you get started
```

Then confirm by eye:
- [ ] Section order matches the skeleton in templates.md
- [ ] Read Actions sentence is byte-identical to pattern A/B/C/D
- [ ] amp.yaml example (if inline) contains only supported capabilities
- [ ] "a"/"an" correct before provider name in Example integration line
- [ ] Auth intro + prompt lines match the auth-type table
- [ ] Samples link verified with curl (200) if used
- [ ] New guide registered alphabetically in `src/generate-docs.ts`
- [ ] No fabricated objects, scopes, or URLs; TODOs mark every unknown

## Common mistakes

| Mistake | Fix |
|---|---|
| Copying heading case from an old guide (`## What's Supported`) | Use templates.md headings, not existing guides |
| Object bullets without links | Every bullet: `[name](url)` or name + `<!-- TODO: Add API reference link -->` |
| Paraphrasing the Read Actions sentence | Copy pattern A/B/C/D byte-for-byte, fill slots only |
| Linking samples repo without checking it exists | curl the raw amp.yaml URL first; 404 → inline manifest |
| `## Add <Provider> App Details in Ampersand` as H2 / rephrased | `### Add your <Provider> app info to Ampersand`, nested under "Before you get started" |
| Provider-app instructions for non-OAuth-auth-code providers | Only OAuth2 Authorization Code needs a Provider App; others get the "no Provider App" intro line |
| Forgetting navigation registration | New slug goes into `src/generate-docs.ts`, alphabetical, then `pnpm run gen` |
