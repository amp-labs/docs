# Provider guide templates

Copy the fixed text exactly. Fill only the `<angle-bracket>` slots, and leave out any part that doesn't apply to this provider.

## Skeleton

```markdown
---
title: "<displayName>"
---

## What's supported

### Supported actions

### Notes                 ← only for caveats specific to this provider

### Supported objects     ← deep connectors only

### Example integration

## Before you get started

### <credential section for the auth type>

## Using the connector

<provider-specific sections, such as rate limits, go last>
```

## Supported actions

```markdown
### Supported actions

This connector supports:

- <Read bullet>
- [Subscribe Actions](/subscribe-actions).
- [Write Actions](/write-actions).
- [Proxy Actions](/proxy-actions), using the base URL `<baseURL>`.
```

Pick the Read bullet by which objects the connector's code reads incrementally.

None:

```markdown
- [Read Actions](/read-actions), including full historic backfill. Please note that incremental read is not supported, a full read of the <Provider> instance will be done for each scheduled read.
```

Five objects or fewer:

```markdown
- [Read Actions](/read-actions), including full historic backfill. Please note that incremental read is supported only for `<object1>` and `<object2>` currently. For all other objects, a full read of the <Provider> instance will be done per scheduled read.
```

More than five objects (also append ` (supports incremental read)` to each of those object bullets):

```markdown
- [Read Actions](/read-actions), including full historic backfill. Incremental reading is supported for the objects listed below. For all other objects, a full read of the <Provider> instance will be done per scheduled read.
```

All objects:

```markdown
- [Read Actions](/read-actions), including full historic backfill and incremental read for all supported objects.
```

## Supported objects

```markdown
### Supported objects

The <Provider> connector supports reading from the following objects:

- [<objectName>](<API reference URL>)

The <Provider> connector supports writing to the following objects:

- [<objectName>](<API reference URL>)
```

List objects alphabetically, named as in `amp.yaml`. For a proxy-only connector, leave the section out.

## Example integration

If the samples manifest exists:

```markdown
### Example integration

For an example manifest file of a <Provider> integration, visit our [samples repo on GitHub](https://github.com/amp-labs/samples/blob/main/<catalogKey>/amp.yaml).
```

Use "an" before a vowel sound ("an Asana integration"). Otherwise, include a manifest with a block for each supported action only:

````markdown
### Example integration

To define an integration for <Provider>, create a manifest file that looks like this:

```YAML
# amp.yaml
specVersion: 1.0.0
integrations:
  - name: <catalogKey>Integration
    displayName: My <Provider> Integration
    provider: <catalogKey>
    read:
      objects:
        - objectName: <object>
          destination: <destinationName>
    write:
      objects:
        - objectName: <object>
    proxy:
      enabled: true
```
````

## Before you get started

### OAuth2 Authorization Code

```markdown
## Before you get started

To integrate <Provider> with Ampersand, you will need a [<Provider> account](<signup URL>).

Once your account is created, you'll need to create a <Provider> app and obtain the following credentials from it:

- Client ID
- Client Secret

You will then use these credentials to connect your application to Ampersand.

### Creating a <Provider> app

1. Log in to the [<Provider> developer portal](<URL>).
2. <steps to create the app>
3. Set the redirect URL to: `https://api.withampersand.com/callbacks/v1/oauth`
4. <steps to copy the Client ID and Client Secret>

### Add your <Provider> app info to Ampersand

1. In the [Ampersand Dashboard](https://dashboard.withampersand.com), open the project for your <Provider> integration and go to **Provider apps**.

2. Click **+ New App**.

3. Select **<Provider>** from the **Provider** list.

4. Enter the **Client ID** and **Client Secret** obtained from your <Provider> app.

5. Click **Save changes**.
```

If the catalog sets `oauth2Opts.explicitScopesRequired`, list the scopes in "Creating a <Provider> app", and end step 6 with: `, and the scopes your app uses, one per line.`

### API key, Basic Auth and OAuth2 Client Credentials

```markdown
## Before you get started

To connect <Provider> with Ampersand, you will need a [<Provider> account](<signup URL>).

### Creating <Provider> credentials

1. <steps to create the credentials>
2. <where to copy each value>
```

Add a step for each dynamic token: what it is and where to find it. For example: "Note your workspace. This is the subdomain in your <Provider> URL (if your URL is `https://mycompany.example.com`, your workspace is `mycompany`)."

If the username or password isn't what the name suggests (for example, the API key goes in the username), say so and link the provider's auth docs.

## Using the connector

```markdown
## Using the connector

<auth intro line>

To start integrating with <Provider>:

- Create a manifest file like the [example above](#example-integration).
- Deploy it using the [amp CLI](/cli/overview).
- If you are using Read Actions, create a [destination](/destinations).
- Embed the [InstallIntegration](/embeddable-ui-components#install-integration) UI component. <auth prompt line>
- Start using the connector!
   - If your integration has [Read Actions](/read-actions), you'll start getting webhook messages.
   - If your integration has [Write Actions](/write-actions), you can start making API calls to our Write API.
   - If your integration has [Proxy Actions](/proxy-actions), you can start making Proxy API calls.
```

Keep the destination bullet and each sub-bullet only for supported actions. With Subscribe, the first sub-bullet reads `If your integration has [Read Actions](/read-actions) or [Subscribe Actions](/subscribe-actions), you'll start getting webhook messages.`

| Auth type | Auth intro line | Auth prompt line |
|---|---|---|
| OAuth2 Authorization Code | none | The UI component will prompt the customer for OAuth authorization. |
| OAuth2 Client Credentials | This connector uses OAuth2 Client Credentials grant type, which means that you do not need to set up a Provider App before getting started. (Provider apps are only required for providers that use OAuth2 Authorization Code grant type.) | The UI component will prompt the customer for their credentials. |
| API Key | This connector uses API Key auth, which means that you do not need to set up a Provider App before getting started. (Provider apps are only required for providers that use OAuth2 Authorization Code grant type.) | The UI component will prompt the customer for their API key. |
| Basic Auth | This connector uses Basic Auth, which means that you do not need to set up a Provider App before getting started. (Provider apps are only required for providers that use OAuth2 Authorization Code grant type.) | The UI component will prompt the customer for their username and password. |

If the customer also enters dynamic tokens, extend the prompt line, for example "…for their credentials and workspace."

For a proxy-only connector, replace the last bullet ("Start using the connector!" and its sub-bullets) with one of these:

```markdown
- Start making [Proxy Calls](/proxy-actions), and Ampersand will automatically handle the authentication with <Provider>.
```

```markdown
- Start making [Proxy Calls](/proxy-actions), and Ampersand will automatically attach the correct header required by <Basic Auth or API Key auth>. Please note that this connector's base URL is `<baseURL>`.
```

Use the first for OAuth and the second for Basic Auth and API key.

## Data gathering

From the provider's entry in the [catalog](https://raw.githubusercontent.com/amp-labs/connectors/main/internal/generated/catalog.json):

- `displayName`: title
- `authType` and `oauth2Opts.grantType`: auth-type variant
- `baseURL`: Proxy bullet, keeping `{{.placeholders}}`
- `support`: supported actions
- `metadata`: dynamic tokens

If the provider isn't in the catalog, ask for the connectors branch and start the draft with `{/* Draft based on branch: <branch>; update links after merge */}`.

For a deep connector, read `providers/<folder>/` in the connectors repo (usually the catalog key in lowercase):

- Objects come from `supports.go` and `schemas.json`. If the code and `schemas.json` disagree, follow the code and add a TODO.
- Incremental read shows as `IncrementalObjects`-style maps, or handlers that filter on a timestamp (`since`, `updated_at`).

For each object, link the provider's API reference page for that resource. Never invent a URL path.
