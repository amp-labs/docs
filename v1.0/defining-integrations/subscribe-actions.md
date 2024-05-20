---
title: "Subscribe Actions (Coming Soon)"
slug: "subscribe-actions"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
---
A subscribe action allows your app to listen to events happening in your customer's SaaS. Whenever an event of interest happens, we will make a request to a webhook endpoint you expose to us.

To define a subscribe action, add a `subscribe` key to the integration you've defined in `amp.yaml`

```yaml
   subscribe:
      objects:
        ...
```

# Subscribe to standard objects

For Salesforce, we support subscribe actions for the standard objects listed on [this page](https://developer.salesforce.com/docs/atlas.en-us.242.0.object_reference.meta/object_reference/sforce_api_associated_objects_change_event.htm), under the heading "Objects That Follow This Model". 

For Hubspot, we support subscribe actions for the following standard objects:

- contact
- company
- deal
- ticket
- product
- lineItem
- conversation

To subscribe to a standard object, specify the following:

- **objectName**: the name of the standard object according to the official documentation of the CRM, converted to camel case
- **destination**: a [webhook ](doc:destinations#webhook) that you host, which we should make a request to when there's an event
- **event**: we support listening to the following events:
  - `create`: when an item is created
  - `delete`: when an item is deleted
  - `update`: when one of more fields that you're interested in has changed

## Subscribe to creates

If you specify `create` as the event, then Ampersand will make a POST request to your webhook when an item is created.

```yaml
   actions:
    - type: subscribe
      objects:
        - objectName: opportunity
          destination: opportunityCreatedWebhook
          event: create
```

The request body that Ampersand makes to your webhook will have the following data:

- **primaryKey**: the [primary key](doc:glossary#primary-key) of the item that has been created
- **event**: will be `create`
- **createTime**: UTC timestamp of when the item was created 
- **fields**: all the fields of the new item that's available from the API of the customer's CRM, including standard fields and custom fields

```text
{
  "primaryKey": "0014x00001STswrAAD",
  "event": "create",
  "createTime": "2023-04-10T21:14:59.000+0000",
  "fields": {
    "name": "New Contract",
    "stageName": "Closed Won",
    "amount": 20000.0,
    "lastViewedDate": "2023-04-10T21:14:59.000+0000",
    ...
  }
}
```

## Subscribe to deletes

If you specify `delete` as the event, then Ampersand will make a POST request to your webhook when an item is deleted.

```yaml
   actions:
    - type: subscribe
      objects:
        - objectName: opportunity
          destination: opportunityDeletedWebhook
          event: delete
```

The request body that Ampersand makes to your webhook will have the following data:

- **primaryKey**: the [primary key](doc:glossary#primary-key) of the item that has been deleted
- **event**: will be `delete`
- **deleteTime**: UTC timestamp of when the item was deleted 

```text
{
  "primaryKey": "0014x00001STswrAAD",
  "event": "delete",
  "deleteTime": "2023-04-10T21:14:59.000+0000"
}
```

## Subscribe to field updates

To subscribe to field updates, define `update` as the event, and provide:

- **watchFields:** a list of fields you are watching for changes on. When one or more of these fields change value on an item, we will make a POST request to your webhook.
- **additionalFields:** when we make a POST request, we can read values from additional fields and provide them in the request body. This is especially if you want to do additional filtering on the events. 

As an example, you are building a sales enablement tool and you want to enable your users to set up automations for when a "deal room" should be created based on changes in their Salesforce Opportunities. If base case of the automation is when the stage changes, and you want to also allow your users to add additional criteria (e.g. a deal room should only be created if the expected revenue is over $10,000), then you can define the following action:

```yaml
   actions:
    - type: subscribe
      objects:
        - objectName: opportunity
          destination: opportunityUpdatedWebhook          
          event: update
          watchFields:
            - fieldName: stageName
          additionalFields:
            # Add expectedRevenue as an additional field so we can post-filter on it.
            - fieldName: expectedRevenue
            # Other fields that we want to read.
            - fieldName: accountId
            - fieldName: name
            - fieldName: description
```

When we make a POST request to your webhook, the request body will the following:

- **primaryKey**: the [primary key](doc:glossary#primary-key) of the item that has changed
- **event**: will be `update`
- **updateTime**: UTC timestamp of when the item was updated
- **changedField**: the field that has changed and its current value. If the field has been deleted, its **currentValue** will be `null`
- **otherFields**: the current values of unchanged fields from `watchFields` as well as the fields from `additionalFields`. If a field is unset, it will have the value `null`.

```text
{
  "primaryKey": "0064x00000MwTVcAAN",
  "updateTime": "2023-03-11T21:14:59.000+0000",
  "changedField": {
    "fieldName": "stageName",
  	"currentValue": "Closed Won"
  },
  "otherFields": {
    "expectedRevenue": 10000.0,
    "accountId": "0014x00001STswrAAD",
    "name": "Contract Renewal",
    "description": null  
  }
}
```

# Subscribe to custom objects

> 📘 Only available for Salesforce
> 
> We only support subscribing to custom objects for Salesforce.

## Custom objects that your app created

If you're subscribing to a custom object that your app has created with [Write Actions](doc:write-actions), then they are specified the same way as standard objects, since you will know the names of the object and all its fields.

```yaml
      customObjects:
        - objectName: mailMonkeyCampaigns
          destination: campaignWebhook
          event: ...
```

## Custom objects that your user created

If you are subscribing to custom objects that your user has created, then you'll need to prompt them during the set up of the integration to map an existing custom object to a concept in your data model. If they do not have a custom object like it, they can select "none" and the integration will not subscribe to any custom objects. 

For these custom objects, you'll specify:

- **mapToName**: the name to map this custom object to.
- **mapToDisplayName**: the phrasing to display to the user in the set up UI component when asking them to select a custom object (e.g. For the config below, the helper text will say, "Which of your custom objects map to Team?").
- **destination**: just like for a standard object,  you'll need to specify a [webhook ](doc:destinations#webhook) destination.
- **event**: the type of event to subscribe to, only `create` and `update` are supported for custom objects that your user has created.
- **prompt** (optional): additional context that you want to show your user in the set up UI Component about this object. This should be a full sentence.

```yaml
      customObjects:
        - mapToName: team
          mapToDisplayName: Team          
          destination: teamCreatedWebhook
          event: create
          prompt: A team is a set of contacts that you might be selling to at the same time.
```

# Example subscribe action

```yaml
integrations: 
 - name: watchSalesforceOpportunities
   displayName: Subscribe to Changes in Opportunities
   api: salesforce
   actions:
    - type: subscribe
      objects:
        - objectName: opportunity
          destination: opportunityCreatedWebhook
          event: create

        - objectName: opportunity
          destination: opportunityDeletedWebhook
          event: delete

        - objectName: opportunity
          destination: opportunityUpdatedWebhook          
          event: update
          watchFields:
            - fieldName: stageName
          additionalFields:
            - fieldName: accountId
            - fieldName: contactId
            - fieldName: description
            - fieldName: expectedRevenue
```

This will produce the following embeddable UI:

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/abeac6b-image.png",
        null,
        ""
      ],
      "align": "center",
      "sizing": "400px"
    }
  ]
}
[/block]
