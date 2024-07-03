---
title: "Destinations"
slug: "destinations"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
---

We currently support webhooks as destinations for read actions and subscribe actions. When we get new data, we will send a message to your webhook. See [Example webhook message](doc:read-actions#example-webhook-message) for what the payload will look like.

# Specifying the destinations

## Add a destination to the Ampersand Console

Go to the [Destinations page](https://console.withampersand.com/projects/_/destinations/new) of Ampersand Console to add a new Destination. You'll need:
- **Destination name**: this is an alias for the webhook that you can then refer to in the `amp.yaml` file.
- **URL**: this is the URL of your webhook, it must start with `https`. If you do not have a webhook already, you can easily create a temporary one using tools like [Hookdeck Console](https://console.hookdeck.com). 

## Refer to the destination in your integration

For read and subscribe actions, you can specify destinations for each object. You can either have one destination for each object or route multiple objects to the same destination. Here's what your `amp.yaml` file might look like, if you had created 2 destinations in the Ampersand Console, one named `accountWebhook` and one named `contactWebhook`.

```yaml
integrations:
  - name: readFromSalesforce
    displayName: Salesforce read
    provider: salesforce
    read:
      objects:
        - objectName: account
          destination: accountWebhook
        - objectName: contact
          destination: contactWebhook
```

<!-- # Webhook security

We use Svix to deliver the webhooks, so you can use one of the [official Svix SDKs](https://docs.svix.com/receiving/verifying-payloads/how#framework-specific-examples) to verify that the webhook comes from Ampersand, or [do it manually](https://docs.svix.com/receiving/verifying-payloads/how-manual). We will provide you with your webhook secret during the onboarding process. -->

# Other Destinations

We have many other destination types on the roadmap, including:
- Postgres
- Ampersand-hosted Postgres
- Amazon S3
- Google Cloud Storage
