---
title: "Quickstart"
slug: "quickstart"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
---

# Prerequisites

## Install the Ampersand CLI
You will need to have Ampersand CLI in order to deploy integrations. 

### Using Homebrew

```
brew tap amp-labs/cli
brew update
brew install amp-labs/cli/cli
```

### Other systems

Visit https://github.com/amp-labs/cli/releases and download the binary for your machine’s architecture. Place the binary file somewhere on your PATH (e.g. inside `/usr/bin`).

For this Quickstart, we are going to build integrations for a cool new SaaS app called MailMonkey - an email campaign manager that integrates with Salesforce. You can see the final `amp.yaml` file on [Github](https://github.com/amp-labs/samples/blob/main/quickstart/amp.yaml).

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/28feb09-Group_2987.png",
        null,
        ""
      ],
      "align": "center",
      "sizing": "300px"
    }
  ]
}
[/block]


# Define the integrations

To make MailMonkey interoperate seamlessly with our customers' Salesforce, we want to create 3 integrations:

1. **Read Contacts and Leads**: An integration which pulls all Contacts and Leads from Salesforce into MailMonkey.
2. **Create Leads**: An integration which creates a new Lead in Salesforce whenever somebody replies to to a MailMonkey email campaign.
3. **Subscribe to Lead Conversions**: An integration which inserts Salesforce Leads into the "customer" audience segment in MailMonkey whenever a Lead's status becomes "converted" in Salesforce.

Let's create a folder called `source`, with a file inside called `amp.yaml`, this is where we will define our integrations.

## Read Contacts and Leads

Our first integration will have [Read Actions](doc:read-actions). We'll read 2 standard objects from Salesforce: contacts and leads.

```yaml
integrations:
 - name: readContactsAndLeads # name this anything you'd like
   displayName: Read Contacts and Leads
   provider: salesforce
   read:
    standardObjects:
      - objectName: contact
        destination: contactWebhook
        schedule: "*/30 * * * *" # every 30 minutes
        # Always read these fields
        requiredFields:
          - fieldName: firstName
          - fieldName: lastName
          - fieldName: email
        # Customer can decide during set-up if they want us to read these fields
        optionalFields:
          - fieldName: salutation
      - objectName: leads
        destination: leadsWebhook
        schedule: "*/30 * * * *" # every 30 minutes
        requiredFields:
          - fieldName: firstName
          - fieldName: lastName
          - fieldName: email
          - fieldName: isConverted
          # Allow the customer to pick a standard or optional field to map to priority score
          - mapToName: priority
            mapToDisplayName: Priority Score
            prompt: Which field do you use to track the priority of a lead?
        # All other fields in a Lead are optional, and customers can pick during set up
        optionalFieldsAuto: all
```

## Create Leads

Our second integration will have [Write Actions](doc:write-actions). We want to insert new leads into our customer's Salesforce.

```yaml
 - name: createLeads
   displayName: Create Leads
   provider: salesforce
   actions:
    - type: write
      objects:
        # Create a new lead in Salesforce whenever we make an API request.
        - objectName: lead
```

Once a customer installs our integration, MailMonkey's application backend will make an API call to Ampersand to create the new lead whenever there's an email reply that we detect.

## Subscribe to Lead Conversions

Our third integration will have [Subscribe Actions](doc:subscribe-actions). We want to watch for updates to the `isConverted` field of Salesforce leads, and Ampersand will make a POST request to our webhook whenever that happens. We'll define a [Destination](doc:destinations) for our webhook. Once our webhook receives a request, our application code will add that lead to a customer audience segment within MailMonkey.

```yaml
 - name: subscribeToLeadConversions
   displayName: Subscribe to Lead Conversions
   provider: salesforce
   subscribe:
      objects:
        - objectName: lead
          destination: leadConvertedWebhook          
          event: update
          # We watch for changes on these fields
          watchFields:
            - fieldName: isConverted
          # We also want the values of these fields to be sent to our webhook.
          additionalFields:
            - fieldName: firstName
            - fieldName: lastName
            - fieldName: email            
```

## Deploy the completed config file

You can see the final `amp.yaml` file on [Github](https://github.com/amp-labs/samples/blob/main/quickstart/amp.yaml). 

Once we are happy with the definition of our integrations, we can deploy them with the amp CLI:

```
amp login
# Our amp.yaml file is
amp deploy source --project=my-project-id
```

# Embed UI components

Next, we will use Ampersand's react library to embed ready-made UI components into our app, so that our customers can start using our shiny new integrations! We'll use the `InstallIntegration` component for the auth flow and configuration steps. Check out [Embed UI components](doc:embeddable-ui-components) for more details on this component and other components to help your users set up and manage their integrations. 

We decide that we want each integration to have its own page, and we are going to use `react-router-dom` to help us with page routing.

Here's a simplified version of what our frontend code would look like:

```typescript
import { AmpersandProvider, InstallIntegration } from '@amp-labs/react';
import { Routes, Route } from 'react-router-dom';

const options = {
  projectId: 'PROJECT_ID', // Your Ampersand project ID.
  apiKey: 'API_KEY',// Your Ampersand API key.
};

function App() {
  return (
  // Wrap your app with AmpersandProvider.
    <AmpersandProvider options={options}>
      <Routes>
        <Route path = '/first-integration' element =
          {<InstallIntegration 
            // The name of the integration from amp.yaml
            integration = "readContactsAndLeads"
            // The ID that your app uses to identify this end user.
            consumerRef = {userId}
            // The display name that your app uses for this end user.
            consumerName = {userName}
            // The ID that your app uses to identify the user's company, org, or team.
            groupRef = {groupId}
            // The display name that your app uses for this company, org or team.
            groupName = {groupName}
          />}
        />
        <Route path = '/second-integration' element =
          {<InstallIntegration 
            integration = "createLeads"
            consumerRef = {userId}
            consumerName = {userName}
            groupRef = {groupId}
            groupName = {groupName}
          />}
        />
        <Route path = '/third-integration' element =
          {<InstallIntegration 
            integration = "subscribeToLeadConversions"
            consumerRef = {userId}
            consumerName = {userName}
            groupRef = {groupId}
            groupName = {groupName}
          />}
        />          
      </Routes>
      // Rest of the MailMonkey app goes here
    </AmpersandProvider>
  )
}
```
