---
name: writing-provider-guides
description: Use when creating, updating or reviewing an Ampersand provider (connector) guide in src/provider-guides/: adding a new connector doc, extending a guide with deep connector support (Read/Write/Subscribe), or fixing a guide's structure, headings, notes or wording.
paths:
  - "src/provider-guides/**"
---

# Writing provider guides

A provider guide is a technical page for builders we never talk to. They read it to learn what they
can use with this provider and how to set it up, and they read many guides, so every guide reads the
same way: one structure with fixed wording, assembled from [templates.md](templates.md). Copy its
sentences verbatim and fill only the `<angle-bracket>` slots. Older guides drifted, so never imitate
an existing guide; your judgment goes into gathering accurate provider facts, not into phrasing.

This skill is the one source for these rules, for people and for the agents that write and review
guides.

## What a guide says

A guide says what the connector does, never what it doesn't. A "not supported" line reads as a gap
we advertise or a promise about the future, and what was left out of a build belongs in the pull
request, not the guide. So every object, action and feature the connector lacks stays out. Every
list (actions, objects, fields) matches the code at the connector's head, Proxy included. An object
with a write or delete handler supports those actions; the rest are read-only.

## Its shape

- The frontmatter has a `title` and no `description`: the sections say what the guide covers.
- The sections come in this order, so a builder finds the same thing in the same place on every
  guide: Supported actions, Supported objects, Example integration, Before you get started, the
  set-up sections, Using the connector, then Notes. Notes come last, and only when there are any;
  placed earlier, they'd sit before the builder knows what the connector reads.

## What a note is

A note is something a builder needs to know about this provider and wouldn't assume from how
Ampersand works: that a credential reaches one workspace only, how custom objects are named, how
relationships arrive, which fields the provider marks secure, how merged or deleted records
appear, that what a read returns depends on the connecting user's access, that links in records
expire, which states or assignees a read covers, or which field is the record's stable identifier.

What Ampersand handles for every provider isn't a note, because a repeat on each guide hides the
notes that matter: field names and their casing (field mapping handles those), which field
incremental reads use, and rate limits (Ampersand paces requests). Nothing about how the connector
works inside goes in a guide either.

## Its words

The person who connects their account is the "consumer", as in the API's `consumerRef` and the
embeddable components. A guide never calls them the "customer": to a builder reading Ampersand's
docs, the customer is the builder. Older pages say "customer"; don't copy it.

## Workflow

1. **Gather the inputs.** Ask for any you can't derive:
   - provider display name and slug (the folder and file name in
     [amp-labs/connectors](https://github.com/amp-labs/connectors), and the mdx filename);
   - connector type: proxy-only or deep;
   - auth type: `oauth2_authorization_code`, `oauth2_client_credentials`, `api_key`, `basic_auth`
     or custom;
   - capabilities: read, write, subscribe, proxy;
   - base URL, keeping placeholders like `{{.workspace}}`.

   Optional, with `<!-- TODO: ... -->` where missing: object lists and API reference URLs, dynamic
   tokens, credential steps, screenshots.
2. **Inspect the connectors repo** to confirm them ("Data gathering" in templates.md). Never
   fabricate objects, scopes, endpoints or URLs; a TODO beats a guess.
3. **Classify the incremental-read pattern** (A: none, B: up to 5 objects, C: all, D: more than 5).
   It picks the Read bullet. Claim incremental reads only with evidence from code.
4. **Assemble the MDX** in the order above from templates.md, with the auth-type variants. When
   updating a guide, bring the sections you touch to the templates, keep factual content
   (credential steps, screenshots), move notes to the end, and drop a rate-limits section.
5. **Register navigation** (new guides): add `"provider-guides/<slug>"` to the collapsed "All
   providers" group (in "Integrations") in `src/generate-docs.ts`, sorted case-insensitively, then
   run `pnpm run gen-docs`. Add a chip, `<a href="/provider-guides/<slug>">Display Name</a>`, to
   `src/provider-guides/overview.mdx` in alphabetical order: deep connectors (Read, Write or
   Subscribe) under "Deep connectors" in their category, proxy-only under "Auth and proxy". When a
   guide goes from proxy-only to deep, move its chip.
6. **Run the checklist** below.

## Fixed rules

- Every object bullet is a link: `- [<objectName>](<API reference URL>)`, or
  `- <objectName> <!-- TODO: Add API reference link -->` when none is found.
- Headings are the exact strings from templates.md, in sentence case.
- Action bullets go Read, Subscribe, Write, Proxy, only the supported ones, each ending with a
  period. The Proxy bullet carries the base URL in backticks.
- Fixed URLs: OAuth redirect `https://api.withampersand.com/callbacks/v1/oauth`, dashboard
  `https://dashboard.withampersand.com`, samples
  `https://github.com/amp-labs/samples/blob/main/<slug>/amp.yaml`.
- Example integration: link the samples `amp.yaml` only when it exists
  (`curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/amp-labs/samples/main/<slug>/amp.yaml`
  returns 200); otherwise use the inline manifest.
- Each dynamic token (`{{.workspace}}`, `{{.region}}`) is explained once under "Before you get
  started": what it is and where the consumer finds it.
- Backticks for object names, field names, tokens and URLs as values; `[text](url)` for every
  link, no raw URLs in prose.
- Imperative voice, no future tense, "GitHub" with a capital H.
- For deep connectors, Read and Write are supported when their implementation files exist in
  `providers/<slug>/`, even if the catalog's `Support` flags lag.

## Checklist

```bash
F=src/provider-guides/<slug>.mdx
grep -n "^#" $F                         # headings match templates.md, in the fixed order, Notes last
sed -n '/### Supported objects/,/### Example integration/p' $F | grep "^- " | grep -v "\[.*\](" | grep -v "TODO"   # unlinked objects: must print nothing
grep -n "Proxy Actions" $F              # base URL in backticks
grep -c "{{\." $F                       # each token also explained in Before you get started
grep -n -i "customer\|not supported\|rate limit" $F   # must print nothing
awk 'NR>1 && /^---$/{exit} NR>1' $F                 # frontmatter: title only
```

Then by eye:
- [ ] The Read bullet is pattern A, B, C or D byte for byte.
- [ ] Every list matches the code at the connector's head, and nothing the connector lacks appears.
- [ ] Each note is one a builder wouldn't assume from Ampersand.
- [ ] An inline `amp.yaml` holds only supported capabilities.
- [ ] "a" or "an" fits the provider name in the Example integration line.
- [ ] Auth intro and prompt lines match the auth-type table.
- [ ] A samples link was checked with curl.
- [ ] A new guide is in `src/generate-docs.ts` and has its chip in `src/provider-guides/overview.mdx`.
