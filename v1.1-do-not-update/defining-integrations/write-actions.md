---
title: "Write Actions"
slug: "write-actions"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Wed Apr 05 2023 05:39:59 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Thu May 11 2023 16:30:21 GMT+0000 (Coordinated Universal Time)"
---
A write action writes data to your customer's SaaS whenever you make an API request to us. 

The top-level keys of a write action are:

- **type:** must be `write`
- A list of standard objects and custom objects to write.

```yaml
  actions:
    - type: write
      standardObjects:
        ...
      customObjects:
        ...
```

# Write to standard objects

You can use Ampersand to write to any [Salesforce standard object](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_list.htm) or [Hubspot standard object](https://developers.hubspot.com/docs/api/crm/understanding-the-crm).

You will specify:

- **objectName**:  to indicate which standard object. This should match the name of the object in the official Salesforce and Hubspot documentation, converted to camel case. For example, if you'd like to read Salesforce [Contract Line Items](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_contractlineitem.htm), which Salesforce identifies as `ContractLineItem`, write `contractLineItem` as the object name. Likewise, if you'd like to read Hubspot [Line Items](https://developers.hubspot.com/docs/api/crm/line-items), which Hubspot identifies as `line-item`, write `lineItem` as the object name.
- **mode**: the type of write, which can be:
  - `insert`: create a new instance of an object (e.g. create a new Contact in Salesforce)
  - `update`: update an existing instance of an object (e.g. update the email address of a Contact in Salesforce)
- **endpoint**: the endpoint that Ampersand should expose for you to make requests to when you want to make a write. See [Defining and using API endpoints](doc:write-actions#defining-and-using-api-endpoints)
- **schedule** (optional): for writes that can be batched together, provide a schedule for when the batched writes should happen. If this value is missing, then all writes will happen immediately when you make an API request to Ampersand. For most cases, batched writes are recommended in order to reduce the impact of your integration on your customers CRM API quotas. We support 2 formats for defining a schedule:
  - [cron syntax](https://docs.gitlab.com/ee/topics/cron/) 
  - A simplified 3-word schedule syntax in the format of "every [integer] [minutes/hours/days]" (e.g. "every 2 hours", "every 1 days"). Please note that the last word is always plural.
- **customFields** (optional): any custom fields you want to create.

```yaml
      standardObjects:
        - objectName: lineItem
          mode: insert
          endpoint: write-line-item
          schedule: every 1 hours
          customFields:
          ...
```

# Write to custom objects

Ampersand can help you create new custom objects inside your customer's CRM, and write to them. When a user installs your integration, Ampersand will create the new custom object in their CRM. 

You will specify:

- **objectName**:  the name of the custom object to create, it can only contain letters and dashes.
- **mode**: same as for standard objects.
- **endpoint**: same as for standard objects.
- **schedule** (optional): same as for standard objects.
- **displayName**: the user-friendly display name of the custom object to create. This name will also show up in the user's CRM.
- **prompt** (optional): additional context you'd like to provide to your user about why your app is creating this new custom object. This should be a full sentence.
- **customFields**: fields of the new custom object.

```yaml
      customObjects:
        - objectName: mailMonkeyCampaigns
          mode: insert
          endpoint: record-campaigns
          schedule: every 2 hours
          displayName: MailMonkey Campaigns
          prompt: When you create campaigns in MailMonkey, we will sync it to your Hubspot.
          customFields:
          ...
```

# Write to custom fields

Ampersand can help you create new custom fields inside your customer's CRM, and write to them. These custom fields can be a part of custom objects you create, or standard objects you write to. For example, if your app helps generate a "warmth score" for leads and you want to sync this score back to your customer's CRM, you can can specify a custom field in the Contact standard object. When a user installs your integration, Ampersand will create the new custom field in their CRM. _Currently, only string type fields are supported._

You will specify:

- **fieldName**: the name of the custom field to create, it can only contain letters and dashes.
- **displayName**: the user-friendly display name of the custom field to create. This name will also show up in the user's CRM.
- **prompt** (optional): additional context you'd like to provide to your user about why your app is creating this new custom field. This should be a full sentence.

```yaml
      standardObjects:
        - objectName: contact
          ...
          customFields:
          - fieldName: warmthScore
            displayName: Warmth Score
            prompt: This is the warmth score we calculated for this contact.
      customObjects:
        - objectName: mailMonkeyCampaigns
          ...
          customFields:
          - fieldName: campaignName
            displayName: Campaign Name
          ...
```

# Defining and using API endpoints

Once your users install an integration with a write action, your app can write data to their CRM by making an API call to Ampersand.

When you deploy your `amp.yaml`, we'll expose endpoints for each of the objects in your write actions in the format of:

`<ampersand_root_url>/<endpoint_value_you_defined_in_config>`

The Ampersand root URL is `https://store.withampersand.com/projects/` followed by your Ampersand project ID.

To request a write, make a POST request to an endpoint. 

If you specified `insert` mode in `amp.yaml`, the request body must have the following:

- **groupId** (string): the ID of the [group](doc:glossary#group-id) whose CRM you are writing to.
- **fields** (object): values of all the fields for the new item

If you specified `update` mode in `amp.yaml`, the request body must have the following:

- **groupId** (string): the ID of the [group](doc:glossary#group-id) whose CRM you are writing to.
- **primaryKey** (string): the [primary key](doc:glossary#primary-key) of the item to update.
- **fields** (object): values for the fields that you'd like to update

# Example write action and API calls

```yaml
 integrations: 
  - name: writeToSalesforce
    displayName: Write Data to Salesforce
    api: salesforce
    actions:
    - type: write
    
      standardObjects:
        # Create accounts
        - objectName: account
          mode: insert
          endpoint: create-account
        # Update contacts with custom field
        - objectName: contact
          mode: update
          endpoint: add-warmth-score
          customFields:
          - fieldName: warmthScore
            displayName: Warmth Score
            prompt: This is the warmth score we calculate for each contact.
     
       customObjects:
        # Create campaigns (custom object)
        - objectName: mailMonkeyCampaigns
          mode: insert
          endpoint: create-campaign
          prompt: When you create campaigns in MailMonkey, we will sync it to your Salesforce.
          customFields:
          - fieldName: campaignName
            displayName: Campaign Name
          - fieldName: campaignDescription
            displayName: Campaign Description
```

This will produce the following embeddable UI:

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/108a231-image.png",
        null,
        ""
      ],
      "align": "center",
      "sizing": "400px"
    }
  ]
}
[/block]


To create new Accounts, make the following request:

```
POST https://store.withampersand.com/projects/<project-id>/create-account

Request body: 
{
  groupId: "xye23r3df",
  fields: {
    name: "Big Co.",
  	numberOfEmployees: 10000
  }
}
```

To update Contacts with the custom field Warmth Score, make the following request:

```
POST https://store.withampersand.com/projects/<project-id>/add-warmth-score

Request body: 
{
  groupId: "xye23r3df",
  primaryKey: "wsl3k2dk",
  fields: {
    warmthScore: "ready-for-close"
  }
}
```

To create new MailMonkey Campaigns (which is a custom object), make the following request:

```
POST https://store.withampersand.com/projects/<project-id>/create-campaign

Request body: 
{
  groupId: "xye23r3df",
  fields: {
    campaignName: "New Feature Announcement",
  	campaignDescription: "Update customers on newest features"
  }
}
```
