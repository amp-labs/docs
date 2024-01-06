---
title: "Define integrations"
slug: "defining-integrations"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 22:16:04 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Wed Apr 12 2023 18:05:34 GMT+0000 (Coordinated Universal Time)"
---
To start defining integrations with Ampersand, create a new directory called `amp`, which will hold your `amp.yaml` file and any code files for custom transform functions that `amp.yaml` references. (See [Transformation Functions](doc:transformation-functions).) All your integrations should be defined in the same `amp.yaml` file. For example, your directory structure might look like this:

```
amp/
  amp.yaml
  custom-function-1.ts
  custom-function-2.ts
```

The high-level keys of `amp.yaml` are the following:

- **specVersion: **the version of the amp.yaml spec used, the current version is `0.1.0`
- **appName: **the name of your application, this will be displayed to your users in the UI components
- **integrations:** the list of integrations that your users can install
- **destinations:** if any of your integrations are reading data from your customer's SaaS into your application, destinations define where Ampersand should send the data. See [Destinations](doc:destinations).

The high-level keys of an integration are:

- **name: **the name of the integration, only alphanumeric characters and dashes are allowed.
- **displayName:**the display name of the integration, this is visible to your users in the embeddable UI components and to your team in the Management Console.
- **api: **the API that this integration connects to. See [Supported APIs](doc:supported-apis)
- **actions:** each integration is composed of:
  - [Read Actions](doc:read-actions)
  - [Write Actions](doc:write-actions)
  - [Subscribe Actions](doc:subscribe-actions)

Putting all of this together, the basic structure of an `amp.yaml` file looks like the following:

```yaml yaml
specVersion: 0.1.0
appName: MailMonkey

integrations: 
-name: readSalesforceAccounts
 displayName: Read Accounts from Salesforce
 api: salesforce
 actions:
   ...
-name: watchOppStageChange
 displayName: Subscribe to Stage Changes in Salesforce Opportunities
 api: salesforce
 actions: 
   ...
-name: readHubspotAccounts
 displayName: Read Accounts from Hubspot
 api: hubspot
 actions:
   ...

destinations:
 ...
```
