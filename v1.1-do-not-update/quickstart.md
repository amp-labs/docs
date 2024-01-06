---
title: "Quickstart"
slug: "quickstart"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 22:15:15 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Thu Jul 20 2023 18:24:52 GMT+0000 (Coordinated Universal Time)"
---
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

We'll use the amp CLI's init command to generate the basic file structure for our integrations:

```
amp login
amp init
```

After answering a few questions, we'll get a new folder called `amp`, with a file inside called `amp.yaml`, this is where we will define our integrations, and it will look pretty bare bones to start with. 

## Read Contacts and Leads

Our first integration will have [Read Actions](doc:read-actions). We'll read 2 standard objects from Salesforce: contacts and leads. We'll also define 2 [Destinations](doc:destinations) for these objects, which are 2 Postgres tables, one for each object. (Alternatively, we could have decided to use an Ampersand-hosted data store and make API requests to retrieve our data.)

```yaml
integrations:
- name: readContactsAndLeads
   displayName: Read Contacts and Leads
   api: salesforce
   actions:
    - type: read
      schedule: every 12 hours
      standardObjects:              
      - objectName: contact
        destination: contactTable
        # Always read these fields
        requiredFields:
          - fieldName: firstName
          - fieldName: lastName
          - fieldName: email
        # Customer can decide during set-up if they want us to read these fields
        optionalFields:
          - fieldName: salutation
      - objectName: leads
        destination: leadsTable
        requiredFields:
          - fieldName: firstName
          - fieldName: lastName
          - fieldName: email
          - fieldName: isConverted
      # ...
destinations:
  # Sync Contacts to a Postgres table
  - name: contactsTable
    type: postgres
    tableName: SalesforceContacts
  # Sync Leads to a Postgres table
  - name: leadsTable
    type: postgres
    tableName: SalesforceLeads
```

## Create Leads

Our second integration will have [Write Actions](doc:write-actions). We want to insert new leads into our customer's Salesforce. As soon as we deploy our integration using the Ampersand CLI. Ampersand will expose an API endpoint with the URL of `https://store.withampersand.com/project/<ampersand-project-id>/create-account`.  MailMonkey's application backend will make an API call to it to create the new lead whenever there's an email reply that we detect.

```yaml
 - name: createLeads
   displayName: Create Leads
   api: salesforce
   actions:
    - type: write
      standardObjects:
        # Create a new lead in Salesforce whenever we make an API request.
        - objectName: lead
          mode: insert
          # Specify the how the URL that Ampersand exposes to you should be named.
          endpoint: create-account
```

## Subscribe to Lead Conversions

Our third integration will have [Subscribe Actions](doc:subscribe-actions). We want to watch for updates to the `isConverted` field of Salesforce leads, and Ampersand will make a POST request to our webhook whenever that happens. We'll define a [Destination](doc:destinations) for our webhook. Once our webhook receives a request, our application code will add that lead to a customer audience segment within MailMonkey.

```yaml
 - name: subscribeToLeadConversions
   displayName: Subscribe to Lead Conversions
   api: salesforce
   actions:
    - type: subscribe
      standardObjects:
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
            
destinations:
  # Webhook that Ampersand should make requests to
  - name: leadConvertedWebhook
    type: webhook
    url: webhooks.mailmonkey.com/salesforce-lead-converted
```

## Deploy the completed config file

You can see the final `amp.yaml` file on [Github](https://github.com/amp-labs/samples/blob/main/quickstart/amp.yaml). 

Once we are happy with the definition of our integrations, we can deploy them with the amp CLI:

```
amp deploy
```

# Embed UI components

Next, we will use Ampersand's react library to embed ready-made UI components into our app, so that our customers can start using our shiny new integrations! We'll use the `InstallIntegration` component for the auth flow and configuration steps. Check out [Embed UI components](doc:embeddable-ui-components) for more details on this component and other components to help your users set up and manage their integrations. 

We decide that we want each integration to have its own page, and we are going to use `react-router-dom` to help us with page routing.

Here's a simplified version of what our frontend code would look like:

```typescript
import { ChakraProvider } from '@chakra-ui/react';
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
      // Wrap the app in ChakraProvider if you're also using it to style
      // the rest of your app, otherwise wrap individual components.
      <ChakraProvider>
        <Routes>
          <Route path = '/first-integration' element =
            {<InstallIntegration 
              // The name of the integration from amp.yaml
              integration = "readContactsAndLeads"
              // The ID that your app uses to identify this end user.
              userId = {userId}
              // The ID that your app uses to identify the user's company, org, or team.
              groupId = {groupId}
            />}
          />
          <Route path = '/second-integration' element =
            {<InstallIntegration 
              integration = "createLeads"
              userId = {userId}
              groupId = {groupId}
            />}
          />
          <Route path = '/third-integration' element =
            {<InstallIntegration 
              integration = "subscribeToLeadConversions"
              userId = {userId}
              groupId = {groupId}
            />}
          />          
        </Routes>
        // Rest of the MailMonkey app goes here
      </ChakraProvider>
    </AmpersandProvider>
  )
}
```
