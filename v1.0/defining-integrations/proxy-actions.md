---
title: "Proxy Actions"
slug: "proxy-actions"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
---
A proxy action allows you to make passthrough API calls to the SaaS provider's API. Ampersand will attach the right authentication headers and also take care of token refreshes when necessary. To define a proxy action, add `proxy` as a key in your integration defined in `amp.yaml`:

```yaml
    proxy:
      enabled: true
```

# Make API calls

All proxy actions expose an API with the base of `https://proxy.withampersand.com`. When making a passthrough call, simply replace the base URL with the Ampersand proxy URL. For example, instead of making a request to `https://subdomain.my.salesforce.com/services/data/v56.0/sobjects/Account`, making the same request to `https://proxy.withampersand.com/services/data/v56.0/sobjects/Account`. To see a list of all the API base URLs we proxy to, see the [catalog file](https://github.com/amp-labs/connectors/blob/main/providers/catalog.go) in our connectors library.

Keep the request body and HTTP verb the same, and add these additional headers so Ampersand knows how to deliver the API request:

- `x-amp-proxy-version`: this should always be 1
- `x-amp-project-id`: your Ampersand project ID. You can find it on your project's [General Settings page](https://console.withampersand.com/projects/_/settings)
- `x-api-key`: your Ampersand API key, if you don't have one yet, create one in the Ampersand Console.

In order for Ampersand to know which SaaS instance to make the API call against, you'll need to provide either:

- `x-amp-installation-id`: the installation ID, you'll get this from the [CreateInstallation](ref:createinstallation) or [ImportInstallation](ref:importinstallation) API endpoints, or the InstallIntegration React component.
- or both of the following:
    - `x-amp-integration-name`: the integration name that you wrote in the `amp.yaml` file
    - `x-amp-group-ref`: the ID for the user group that you used in the [OAuthConnect](ref:oauthconnect) or [ImportInstallation](ref:importinstallation) API endpoints; or the InstallIntegration React component.

Here is an example API call:

```
curl --location --request PUT 'https://proxy.withampersand.com/services/data/v56.0/sobjects/Account' \
--header 'Content-Type: application/json' \ # Other content types are supported
--header 'x-amp-project-id: my-ampersand-project-id' \
--header 'x-api-key: my-api-key' \
--header 'x-amp-proxy-version: 1' \
--header 'x-amp-integration-name: my-salesforce-integration' \
--header 'x-amp-group-ref: company-id-from-my-app' \
--data '{
    # Same request body as if you are sending the request to Salesforce
}'
```
