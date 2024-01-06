---
title: "Embed UI components"
slug: "embeddable-ui-components"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 23:00:25 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Thu Oct 19 2023 23:53:31 GMT+0000 (Coordinated Universal Time)"
---
We offer a React library with embeddable UI components for integration set up and management.

# Project setup

## Credentials

This library requires your application to be wrapped in the `<AmpersandProvider/>` context. `<AmpersandProvider />` takes these props:

- `apiKey`: an API key to access Ampersand services.
- `projectID`: your Ampersand project ID. 

## Styling

This library was created with [Chakra UI](https://chakra-ui.com/). You will need to wrap components in a `ChakraProvider` component and can optionally inject a Chakra theme object. Please see the [Chakra docs](https://chakra-ui.com/docs/styled-system/customize-theme) for how to to define a theme. If your app is already using Chakra UI, then your entire app is likely already wrapped in a `ChakraProvider`, then your themes and global overrides should automatically apply. If you're not using Chakra UI, then you'll likely want to wrap individual components in their own `ChakraProvider` like this:

```typescript
<ChakraProvider>  
  <InstallIntegration/> // a component from the Ampersand library
</ChakraProvider>
```

## Example

Here's an example project set up:

```typescript
import { ChakraProvider, extendTheme, withDefaultColorScheme } from '@chakra-ui/react';
import { AmpersandProvider } from '@amp-labs/react';

const options = {
  projectId: 'PROJECT_ID', // Your Ampersand project ID.
  apiKey: 'API_KEY',// Your Ampersand API key.
};

const theme = extendTheme({
  fonts: {
    body: "system-ui, sans-serif",
    heading: "Arial, serif",
  },
}, withDefaultColorScheme({
  colorScheme: 'blue',
  components: ['Button'],
}));

function App() {
  return (
    // Wrap your app with AmpersandProvider.
    <AmpersandProvider options={options}>
      // Wrap your app in ChakraProvider if you're also using it to style
      // the rest of your app, otherwise wrap individual components.
      <ChakraProvider theme={theme}>
        // Rest of your app
        ...
      </ChakraProvider>
    </AmpersandProvider>
  )
}
```

# Components

## Install integration

`<InstallIntegration>` leads customers through installing an integration. It will first prompt the user to provide their SaaS credentials (for Salesforce, etc.) and then guide them through the configuration of this integration.

The parameters of the component are:

- **integration** (string): the name of an integration that you've defined in `amp.yaml`. See [Defining integrations](doc:defining-integrations).
- **consumerRef** (string): the ID that your app uses to identify this end user.
- **consumerName** (string): the display name for this end user.
- **groupRef** (string): the ID that your app uses to identify a company, team, or workspace. See [group](doc:glossary#group).
- **groupName** (string): the display name for this group.

```typescript
<InstallIntegration 
  integration = "read-accounts-and-contacts"
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
        "https://files.readme.io/858b171-image.png",
        null,
        "InstallIntegration component"
      ],
      "align": "center",
      "caption": "InstallIntegration component (integration not yet installed)"
    }
  ]
}
[/block]


If the integration has already been installed, the component will allow users to view their existing configuration and update them if they would like.

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/bd187fb-image.png",
        null,
        "ManageIntegration component"
      ],
      "align": "center",
      "caption": "InstallIntegration component (integration already installed)"
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
const { isLoaded, isIntegrationInstalled } = useIsIntegrationInstalled("read-accounts-and-contacts", groupRef);
```
