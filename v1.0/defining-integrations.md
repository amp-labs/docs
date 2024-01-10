---
title: "Define integrations"
slug: "defining-integrations"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 22:16:04 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Mon Oct 16 2023 00:57:48 GMT+0000 (Coordinated Universal Time)"
---
To start defining integrations with Ampersand, create a new directory (we recommend calling it `amp`), which will hold your `amp.yaml` file. All your integrations should be defined in the same `amp.yaml` file.

```
amp/
  amp.yaml
```

The high-level keys of `amp.yaml` are the following:

- **specVersion: **the version of the amp.yaml spec used, the current version is `1.0.0`
- **integrations:** the list of integrations that your users can install

The high-level keys of an integration are:

- **name: **the name of the integration, only alphanumeric characters and dashes are allowed.
- **provider: **the API that this integration connects to.
- each integration can include:
  - [Read Actions](doc:read-actions)
  - [Write Actions](doc:write-actions)
  - [Subscribe Actions](doc:subscribe-actions)

Putting all of this together, the basic structure of an `amp.yaml` file looks like the following:

```yaml yaml
specVersion: 1.0.0

integrations: 
-name: readSalesforceAccounts
 provider: salesforce
 read:
   ...
 write:
   ...
 subscribe:
   ...
```
