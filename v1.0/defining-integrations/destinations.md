---
title: "Destinations"
slug: "destinations"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
---

We currently support webhooks as destinations for read actions and subscribe actions. During the Ampersand onboarding process, you will provide the URLs for your webhooks in addition to:
- additional headers you would like Ampersand to send with each request
- alias names for the webhooks so you can refer to them within your `amp.yaml` file

# Specifying the destinations

For read and subscribe actions, you can specify destinations for each object. You can either have one destination for each object or route multiple objects to the same destination.

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

# Webhook security

We use Svix to deliver the webhooks, so you can use one of the [official Svix SDKs](https://docs.svix.com/receiving/verifying-payloads/how#framework-specific-examples) to verify that the webhook comes from Ampersand, or [do it manually](https://docs.svix.com/receiving/verifying-payloads/how-manual). We will provide you with your webhook secret during the onboarding process.

# Other Destinations

We have many other destination types on the roadmap, including:
- Postgres
- Ampersand-hosted Postgres
- Amazon S3
- Google Cloud Storage
