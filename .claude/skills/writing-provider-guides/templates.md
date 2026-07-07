# Provider Guide Templates

**Copy fixed text verbatim. Fill only `<angle-bracket>` slots. Do not rephrase, reorder, or "improve" fixed sentences.**

## Page skeleton (canonical section order)

```markdown
---
title: "<Provider Display Name>"
---

<optional 1–2 sentence intro — ONLY when the provider needs disambiguation,
 e.g. GoTo covering GoToWebinar + GoToMeeting. Most guides have no intro.>

## What's supported

### Supported actions

### Notes                    ← optional; only when real caveats exist

### Supported objects        ← deep connectors only

### Example integration

## Before you get started

### <credential subsections — see auth-type variants below>

## Using the connector

<extra provider-specific sections (API documentation, rate limits, credential
 format quirks) — always LAST, after "Using the connector">
```

---

## Supported actions

```markdown
### Supported actions

This connector supports:

- <Read bullet — exactly one of patterns A–D below>
- [Subscribe Actions](/subscribe-actions).
- [Write Actions](/write-actions).
- [Proxy Actions](/proxy-actions), using the base URL `<base URL>`.
```

Rules: order is Read → Subscribe → Write → Proxy; include only supported actions; every bullet ends with a period; Proxy bullet always carries the base URL in backticks (placeholders preserved, e.g. `` `https://rest.{{.restInstanceId}}.braze.com` ``).

### Read bullet — Pattern A: no incremental read

```markdown
- [Read Actions](/read-actions), including full historic backfill. Please note that incremental read is not supported, a full read of the <Provider> instance will be done for each scheduled read.
```

### Read bullet — Pattern B: incremental for ≤5 objects (list inline)

```markdown
- [Read Actions](/read-actions), including full historic backfill. Please note that incremental read is supported only for `<object1>`, `<object2>` and `<object3>` currently. For all other objects, a full read of the <Provider> instance will be done per scheduled read.
```

### Read bullet — Pattern C: incremental for all objects

```markdown
- [Read Actions](/read-actions), including full historic backfill and incremental read for all supported objects.
```

### Read bullet — Pattern D: incremental for >5 objects (annotate object list)

```markdown
- [Read Actions](/read-actions), including full historic backfill. Incremental reading is supported for the objects listed below. For all other objects, a full read of the <Provider> instance will be done per scheduled read.
```

With Pattern D, append ` (supports incremental read)` to each supporting bullet in the read-objects list.

If a Subscribe action needs provider-specific setup, extend its bullet:
```markdown
- [Subscribe Actions](/subscribe-actions). Please note that [special set up](#set-up-subscribe-actions) is needed for <Provider>.
```

---

## Supported objects (deep connectors)

```markdown
### Supported objects

The <Provider> connector supports reading from the following objects:

- [<objectName>](<upstream API reference URL>)
- [<objectName>](<upstream API reference URL>)

The <Provider> connector supports writing to the following objects:

- [<objectName>](<upstream API reference URL>)
```

Rules:
- **REQUIRED:** every bullet is `[name](url)` linking to the provider's API reference for that object. Unknown URL → `- <objectName> <!-- TODO: Add API reference link -->`. Never a bare name.
- Alphabetical order within each list.
- Object names exactly as used in `amp.yaml` (e.g. `email/hard_bounces`, `user/keys`).
- Pattern D: append ` (supports incremental read)` to supporting read bullets.
- If read + write lists are long, `#### Read objects` / `#### Write objects` subheadings may replace the intro sentences (see procore.mdx).
- If the object list is known to be incomplete:
  ```markdown
  > Note: The list below may be incomplete. <!-- TODO: Confirm supported objects -->
  ```
- Proxy-only connectors: omit this section, or use short prose pointing at the provider's API docs:
  ```markdown
  ### Supported objects

  <Provider> is supported through Proxy Actions only. Use the proxy to call any [<Provider> API](<api docs URL>) endpoint, for example `GET /v1/projects`.
  ```

---

## Example integration

**First check** (observable predicate — do not skip):
```bash
curl -s -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/amp-labs/samples/main/<slug>/amp.yaml
```

**HTTP 200 → samples-link form:**
```markdown
### Example integration

For an example manifest file of a <Provider> integration, visit our [samples repo on GitHub](https://github.com/amp-labs/samples/blob/main/<slug>/amp.yaml).
```
Use "an" instead of "a" when the provider name starts with a vowel sound ("an Outplay integration", "an Asana integration").

**Otherwise → inline-manifest form** (action blocks only for supported capabilities):
```markdown
### Example integration

To define an integration for <Provider>, create a manifest file that looks like this:

```YAML
# amp.yaml
specVersion: 1.0.0
integrations:
  - name: <slug>Integration
    displayName: My <Provider> Integration
    provider: <slug>
    read:
      objects:
        - objectName: <object1>
          destination: <destinationName>
    write:
      objects:
        - objectName: <object1>
    proxy:
      enabled: true
```
```
Proxy-only connectors: keep only the `proxy` block.

---

## Before you get started — auth-type variants

### OAuth2 Authorization Code (Provider App required)

```markdown
## Before you get started

To integrate <Provider> with Ampersand, you will need a [<Provider> account](<signup URL>).

Once your account is created, you'll need to create a <Provider> app and obtain the following credentials from it:

- Client ID
- Client Secret

You will then use these credentials to connect your application to Ampersand.

### Creating a <Provider> app

1. Log in to the [<Provider> developer portal](<URL>).
2. <provider-specific steps…>
3. Set the redirect/callback URL to: `https://api.withampersand.com/callbacks/v1/oauth`
4. <steps to obtain Client ID and Client Secret…>

### Add your <Provider> app info to Ampersand

1. Log in to your [Ampersand Dashboard](https://dashboard.withampersand.com).

2. Select the project where you want to create a <Provider> integration.

   ![Ampersand Project Selection](/images/provider-guides/<image>)

3. Select **Provider Apps**.

4. Select **<Provider>** from the **Provider** list.

5. Enter the **Client ID** and **Client Secret** obtained from your <Provider> app.

6. Click **Save Changes**.
```

Notes: scopes bullet list goes under "Creating a <Provider> app" if the provider requires selecting scopes. Only reference images that actually exist in `src/images/provider-guides/`; otherwise omit the image line (no fabricated paths).

### API Key / Basic Auth / OAuth2 Client Credentials (no Provider App)

```markdown
## Before you get started

To connect <Provider> with Ampersand, you will need a [<Provider> account](<signup URL>).

### Creating <Provider> credentials

1. <steps to generate the API key / client credentials…>
2. <where to copy each value…>
```

- Section title options: `### Creating an API key for <Provider>`, `### Creating <Provider> credentials` — pick what fits the credential.
- **Each dynamic token gets explained here.** Example (from outplay.mdx): "Note your workspace identifier - this is the subdomain in your <Provider> URL (e.g., if your URL is `https://mycompany-api.outplayhq.com`, your workspace is `mycompany`)."
- Nonstandard Basic Auth mapping (e.g. API key as username, blank password) gets stated explicitly and linked to the provider's auth docs, plus this sentence: "The UI components will display this link, so that your users can successfully provide their credentials." For extensive quirks, add a `## Credential format for <Provider>` section at the end of the file (see connectWise.mdx).

---

## Using the connector

```markdown
## Using the connector

<auth intro line — see table; omitted entirely for OAuth2 Authorization Code>

To start integrating with <Provider>:

- Create a manifest file like the [example above](#example-integration).
- Deploy it using the [amp CLI](/cli/overview).
- If you are using Read Actions, create a [destination](/destinations).
- Embed the [InstallIntegration](/embeddable-ui-components#install-integration) UI component. <auth prompt line — see table>
- Start using the connector!
   - If your integration has [Read Actions](/read-actions), you'll start getting webhook messages.
   - If your integration has [Write Actions](/write-actions), you can start making API calls to our Write API.
   - If your integration has [Proxy Actions](/proxy-actions), you can start making Proxy API calls.
```

Rules:
- Include the destination bullet only if Read is supported.
- Include only the "Start using" sub-bullets for supported actions.
- If Subscribe is supported, the first sub-bullet becomes: `If your integration has [Read Actions](/read-actions) or [Subscribe Actions](/subscribe-actions), you'll start getting webhook messages.`

### Auth intro / prompt lines

| Auth type | `<auth intro line>` | `<auth prompt line>` |
|---|---|---|
| OAuth2 Authorization Code | *(omit)* | The UI component will prompt the customer for OAuth authorization. |
| OAuth2 Client Credentials | This connector uses OAuth2 Client Credentials grant type, which means that you do not need to set up a Provider App before getting started. (Provider apps are only required for providers that use OAuth2 Authorization Code grant type.) | The UI component will prompt the customer for their credentials. |
| API Key | This connector uses API Key auth, which means that you do not need to set up a Provider App before getting started. (Provider apps are only required for providers that use OAuth2 Authorization Code grant type.) | The UI component will prompt the customer for their API key. |
| Basic Auth | This connector uses Basic Auth, which means that you do not need to set up a Provider App before getting started. (Provider apps are only required for providers that use OAuth2 Authorization Code grant type.) | The UI component will prompt the customer for their username and password. |

If the customer must also supply dynamic tokens, extend the prompt line, e.g. "…for their API credentials and workspace location."

### Proxy-only ending variant

For proxy-only connectors, replace the last two bullets ("Embed…", "Start using…") with:

```markdown
- Embed the [InstallIntegration](/embeddable-ui-components#install-integration) UI component. <auth prompt line>
- Start making [Proxy Calls](/proxy-actions), and Ampersand will automatically attach the correct header required by <Basic Auth/API Key auth>. Please note that this connector's base URL is `<base URL>`.
```

For OAuth (either grant type) proxy-only connectors, the last bullet is instead:
```markdown
- Start making [Proxy Calls](/proxy-actions), and Ampersand will automatically handle the authentication with <Provider>.
```

---

## Data gathering — amp-labs/connectors repo

### Catalog entry (all connectors)

Fetch `https://raw.githubusercontent.com/amp-labs/connectors/main/providers/<slug>.go` and read the `SetInfo(<Const>, ProviderInfo{...})` block:
- `DisplayName` → guide title
- `AuthType` (+ `Oauth2Opts.GrantType`) → auth-type variant
- `BaseURL` → Proxy bullet (preserve `{{.placeholders}}`)
- `Support` flags → proxy-only capabilities
- `Metadata` / `PostAuthentication` fields → dynamic tokens to document

If the file is missing on `main`, ask the user for the feature branch and note at the top of the draft: `<!-- Draft based on branch: <branch>; update links after merge -->`

### Deep connectors (folder pattern)

Explore `https://github.com/amp-labs/connectors/tree/main/providers/<slug>`:
- `support.go` / `supports.go`, `schemas.json` → object lists
- read/write handler files → capabilities. **Presence of implementation files wins over `Support` flags** — flags lag behind.
- Incremental cues: `SupportsIncremental` / `IncrementalObjects` maps, or handlers filtering on timestamps (`since`, `updated_at`, `modifiedDate`). Mention the cursor field only if explicitly named in code.
- Objects in code override `schemas.json`; note conflicts with a TODO.

### Upstream API reference links

For each object, find the provider's API reference page for that resource (try `developers.<domain>`, `docs.<domain>`, `developer.<domain>`). Link the closest resource-level page. Nothing found → `<!-- TODO: Add API reference link -->`. Never invent URL paths.

---

## Navigation registration (new guides)

1. In `src/generate-docs.ts`, find the `group: "Provider guides"` block.
2. Insert `"provider-guides/<slug>",` keeping case-insensitive alphabetical order; one entry per line, double quotes, trailing comma.
3. Run `pnpm run gen`. If the user asked for no build, remind them to run it later.
