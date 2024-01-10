---
title: "Embed UI components"
slug: "embeddable-ui-components"
excerpt: ""
hidden: false
createdAt: "Tue Apr 04 2023 23:00:25 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Dec 08 2023 05:14:17 GMT+0000 (Coordinated Universal Time)"
---
We offer a React library with embeddable UI components for integration set up and management.

# Project setup

## Install the Ampersand React library

In your repo, use npm to install the package:

```
npm install @amp-labs/react
```

If you are using yarn, you'll have to explicitly install the peer dependencies.

```
yarn add @amp-labs/react @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

## Credentials

This library requires your application to be wrapped in the `<AmpersandProvider/>` context. `<AmpersandProvider />` takes these props:

- `apiKey`: an API key to access Ampersand services.
- `projectId`: your Ampersand project ID. 

## Example

Here's an example project set up:

```typescript
import { AmpersandProvider } from '@amp-labs/react';

const options = {
  projectId: 'PROJECT_ID', // Your Ampersand project ID.
  apiKey: 'API_KEY',// Your Ampersand API key.
};

function App() {
  return (
    // Wrap your app with AmpersandProvider.
    <AmpersandProvider options={options}>
        // Rest of your app
        ...
    </AmpersandProvider>
  )
}
```

# Components

## Install integration

The InstallIntegration component asks your customer for their SaaS credentials, and then guides them through the installation flow for an integration. If they've already installed this integration, then the component will display the current configuration of the integration and allow them to update it. (Please note: each [group](doc:glossary#group) is able to install the integration once, so if someone else in the with the same `groupRef` has already installed the integration, then the user will not be able to install the same integration again.)

The parameters of the component are:

- **integration** (string): the name of an integration that you've defined in `amp.yaml`. See [Defining integrations](doc:defining-integrations).
- **consumerRef** (string): the ID that your app uses to identify this end user.
- **consumerName** (string): the display name for this end user.
- **groupRef** (string): the ID that your app uses to identify a company, team, or workspace. See [group](doc:glossary#group).
- **groupName** (string): the display name for this group.

```typescript
<InstallIntegration 
  integration = "read-salesforce"
  consumerRef = {userId}
  consumerName = {userFullName}
  groupRef = {teamId}
  groupName = {teamName}
/>
```

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/1f151f2-Example_for_docs_1.png",
        "",
        ""
      ],
      "align": "center"
    }
  ]
}
[/block]


## Connect provider

The ConnectProvider component allows your customer to put in their SaaS credential, but does not lead them through the installation flow. After their SaaS credential is persisted by Ampersand, you can then make an API request to the [CreateInstallation](ref:createinstallation) endpoint.

The parameters of the component are:

- **provider** (string): the name SaaS provider, such as "salesforce".
- **consumerRef** (string): the ID that your app uses to identify this end user.
- **consumerName** (string): the display name for this end user.
- **groupRef** (string): the ID that your app uses to identify a company, team, or workspace. See [group](doc:glossary#group).
- **groupName** (string): the display name for this group.

```typescript
<ConnectProvider 
  provider = "salesforce"
  consumerRef = {userId}
  consumerName = {userFullName}
  groupRef = {teamId}
  groupName = {teamName}
/>
```

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/98fc359-ConnectProvider__for_docs_1.png",
        "",
        ""
      ],
      "align": "center"
    }
  ]
}
[/block]


# Hooks

## Check if integration is installed

We provide a hook `useIsIntegrationInstalled` to check if an integration has been installed yet for this [group](doc:glossary#group). It takes in 2 parameters:

- **integration** (string): the name of an integration that you've defined in `amp.yaml`. See [Defining integrations](doc:defining-integrations).
- **groupRef** (string): the ID that your app uses to identify a company, team, or workspace. See [group](doc:glossary#group).

It returns an object with fields `isLoaded`checking if API call is resolved and `isIntegrationInstalled` indicating whether the integration has already been installed by somebody in the group.

```typescript
const { isLoaded, isIntegrationInstalled } = useIsIntegrationInstalled("read-salesforce", groupRef);
```
