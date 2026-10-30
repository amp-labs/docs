---
name: writing-provider-guides
description: Use when creating or updating an Ampersand provider (connector) guide in src/provider-guides/ — adding a new connector doc, extending an existing guide with deep connector support (Read/Write/Subscribe), or fixing a guide's structure, headings, or wording.
---

# Writing provider guides

A guide is assembled from [templates.md](templates.md), not written. Copy its sentences verbatim and fill only the `<angle-bracket>` slots. Older guides drifted, so never copy wording from an existing guide.

## Workflow

1. **Find the catalog key** in the [connectors catalog](https://github.com/amp-labs/connectors/blob/main/internal/generated/catalog.json), for example `fastSpring`. Name the guide `src/provider-guides/<catalogKey>.mdx`. The samples repo and `providers/<catalogKey>.go` use the same key.
2. **Gather facts** as described in "Data gathering" in templates.md: display name, auth type, base URL, supported actions, dynamic tokens and, for deep connectors, objects and incremental read. Never invent objects, scopes, endpoints or URLs. Write a `<!-- TODO: ... -->` instead.
3. **Assemble the MDX** in the skeleton's section order, with the auth-type variant that matches. When updating an existing guide, bring the sections you touch up to the templates, keep factual content such as credential steps, and move non-template sections to the end.
4. **Register a new guide** in `src/generate-docs.ts` and on the Integrations page (`src/provider-guides/overview.mdx`), following the comment at the top of that page. Run `pnpm run gen-docs`.
5. **Run the checks** below.

## Rules

- Claim only actions the catalog's `support` flags allow. If code exists but the flag is false, leave the action out and add a TODO; the catalog needs fixing, not the guide.
- Headings are the exact sentence-case strings in templates.md.
- Actions are listed Read → Subscribe → Write → Proxy. The Proxy bullet carries the base URL in backticks.
- Every object bullet is `[name](API reference URL)`, or `name <!-- TODO: Add API reference link -->` when no page exists.
- Claim incremental read only with evidence in the connector's code. Otherwise use the "none" Read bullet.
- Link the samples manifest only if `curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/amp-labs/samples/main/<catalogKey>/amp.yaml` returns 200. Otherwise include the manifest inline.
- Explain each dynamic token (`{{.workspace}}`, `{{.region}}`) once under "Before you get started": what it is and where the customer finds it.
- Reference only images and videos that exist in `src/images/provider-guides/`.

## Checks

```bash
F=src/provider-guides/<catalogKey>.mdx
grep -n "^#" $F   # headings match templates.md
sed -n '/### Supported objects/,/### Example integration/p' $F | grep "^- " | grep -v "](" | grep -v TODO   # must print nothing
grep -o "{{\.[a-zA-Z]*}}" $F | sort -u   # each one explained under "Before you get started"
pnpm run drift-check -- --mode provider --provider <catalogKey> --out /tmp/drift   # must report 0 errors
```
