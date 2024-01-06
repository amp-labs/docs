---
title: "Read Actions"
slug: "read-actions"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 23:19:50 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Tue Aug 08 2023 04:23:38 GMT+0000 (Coordinated Universal Time)"
---
A read action reads data from your customer's SaaS on a scheduled basis and send them to [Destinations](doc:destinations) that you define. We will keep them in sync with the state of your customer's CRM. For example, if you are reading your customer's Salesforce Contacts and sending them to a Postgres table, we'll ensure that table mirrors the Contacts in your customer's Salesforce even if your customer updates or deletes Contacts.

The top-level keys of a read action are:

- **type:** must be `read`
- **schedule: **how frequently the read should happen. This value can be:
  - `once`: if you would like to do just a one-time read when the integration is installed. You can combine this with [Subscribe Actions](doc:subscribe-actions) in the same integration to be notified of future creates, updates, and deletes.
  - A schedule in [cron syntax](https://docs.gitlab.com/ee/topics/cron/) 
  - A simplified 3-word schedule syntax in the format of "every [integer] [minutes/hours/days]" (e.g. "every 2 hours", "every 1 days"). Please note that the last word is always plural. 
- A list of standard objects and custom objects to read.

```yaml
  actions:
    - type: read
      schedule: every 12 hours
      standardObjects:
        ...
      customObjects:
        ...
```

> 🗺️ On the roadmap
> 
> The ability for your users to define their own sync schedules.

# Read standard objects

You can use Ampersand to read any [Salesforce standard object](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_list.htm) or [Hubspot standard object](https://developers.hubspot.com/docs/api/crm/understanding-the-crm).

You need to specify: 

- **objectName:** to indicate which standard object you'd like to read. This should match the name of the object in the official Salesforce and Hubspot documentation, converted to camel case. For example, if you'd like to read Salesforce [Contract Line Items](https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_contractlineitem.htm), which Salesforce identifies as `ContractLineItem`, write `contractLineItem` as the object name. Likewise, if you'd like to read Hubspot [Line Items](https://developers.hubspot.com/docs/api/crm/line-items), which Hubspot identifies as `line-item`, write `lineItem` as the object name. 
- **destination: **the name of a destination that you've defined in the `destinations` section, see [Destinations](doc:destinations)
- a list of fields

```yaml
      standardObjects:
        - objectName: lineItem
          destination: LineItemTable
          ...
```

## Standard fields

Standard fields can be either be required or optional. If a field is required, then all users who install this integration will need to give your app read access to that field. If a field is optional, then users can choose whether they'd like your app to read that field. For standard fields, you will specify:

- **fieldName: ** the name of the field from the official Salesforce or Hubspot documentation, converted to camel case. For example, if you'd like to read the first name of a [Hubspot contact](https://developers.hubspot.com/docs/api/crm/contacts), write `firstName`.
- **transform** (optional): the name of a file that contains a transformation function which should be applied to this field. See [Transformation Functions](doc:transformation-functions).

```yaml
      standardObjects:
        - objectName: contact
          destination: ...
          requiredFields:
          - fieldName: firstName
          - fieldName: lastName
          - fieldName: email
          optionalFields:
          - fieldName: company
            transform: capitalizeCompanyName.ts
```

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/3854c9d-image.png",
        null,
        "Embeddable UI"
      ],
      "align": "center",
      "sizing": "400px",
      "caption": "Embeddable UI produced by the above config"
    }
  ]
}
[/block]


## Custom fields

There are 2 types of custom fields you might wish to read from: custom fields that your app has created, and custom fields that the user has created.

### Custom fields that your app created

If your app has created custom fields with [Write Actions](doc:write-actions), then you'll know exactly what the fields are called. The syntax for them is exactly like the syntax for a standard field, with **fieldName** and optional **transform**. 

### Custom fields that your user created

If you'd like to read custom fields that your user has created, then you will not know the fields names. You'll need to ask your users during the set up of the integration to map an existing custom field to a concept in your product. If they do not have a custom field like it, they can select "none" and the integration will not read any custom fields. 

For these custom fields, you'll specify:

- **mapToName:** when we deliver the data from this custom field to you, this is the name that we'll use to identify the field. 
- **mapToDisplayName:** the phrasing to display to the user in the set up UI component when asking them to select a custom field (e.g. For the config below, the helper text will say, "Which of your custom fields map to Contact Notes?")
- **prompt** (optional): additional context that you want to show your user in the set up UI Component about this field. This should be a full sentence.

```yaml
      standardObjects:
        - objectName: contact
          destination: ...
          customFields:
          # field that your app created
          - fieldName: myAppPriorityScore
          # field that your user created
          - mapToName: notes
            mapToDisplayName: Contact Notes
            prompt: These are notes that you would like to surface in our app. 
            ...
```

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/0146013-image.png",
        null,
        "Embeddable UI produced by the above config"
      ],
      "align": "center",
      "sizing": "400px",
      "caption": "Embeddable UI produced by the above config"
    }
  ]
}
[/block]


# Read custom objects

There are 2 types of custom objects you might wish to read from: custom objects that your app has created, and custom objects that the user has created.

## Custom objects that your app created

If you're reading a custom object that your app has created with [Write Actions](doc:write-actions), then they are specified the same way as standard objects, since you will know the names of the object and all its fields.

```yaml
      customObjects:
        - objectName: mailMonkeyCampaigns
          destination: ...
          requiredFields:
            ... 
          optionalFields:
            ...
```

## Custom objects that your user created

If you are reading custom objects that your user has created, then you'll need to prompt them during the set up of the integration to map an existing custom object to a concept in your data model. If they do not have a custom object like it, they can select "none" and the integration will not read any custom objects. 

For these custom objects, you'll specify:

- **mapToName**: when we deliver the data from this custom object to you, this is the name that we'll use to identify the object. 
- **destination**: just like for a standard object, you'll need to provide the name of a destination that you've defined in the `destinations` section, see [Destinations](doc:destinations).
- **mapToDisplayName**: the phrasing to display to the user in the set up UI component when asking them to select a custom object (e.g. For the config below, the helper text will say, "Which of your custom objects map to Team?")
- **prompt** (optional): additional context that you want to show your user in the set up UI Component about this object. This should be a full sentence.

```yaml
      customObjects:
        - mapToName: team
          destination: TeamTable
          mapToDisplayName: Team
          prompt: A team is a set of contacts that you might be selling to at the same time.
          customFields:
            - mapToName: teamName
              mapToDisplayName: Team Name
```

[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/f99fbf6-image.png",
        null,
        "Embeddable UI produced by the above config"
      ],
      "align": "center",
      "sizing": "400px",
      "caption": "Embeddable UI produced by the above config"
    }
  ]
}
[/block]


# Example read action

```yaml yaml
integrations: 
 - name: readSalesforce
   displayName: Read Data from Salesforce
   api: salesforce
   actions:
    - type: read
      schedule: every 2 hours
      
      standardObjects:
      
      - objectName: account
        destination: AccountTable
        requiredFields: 
        - fieldName: name
        - fieldName: industry
        optionalFields:
        - fieldName: annualRevenue
        - fieldName: website
          transform: removeHttpPrefix.ts
              
      - objectName: contact
        destination: ContactTable
        requiredFields:
          - fieldName: firstName
          - fieldName: lastName
          - fieldName: email
        customFields:
          - mapToName: pronoun
            mapToDisplayName: Pronoun
            prompt: We will use this word when addressing this person in emails we send out.
      
      customObjects:

        - objectName: mailMonkeyCampaigns
          destination: CampaignsTable
          requiredFields:
            - fieldName: campaignName
              fieldName: status
            
        - mapToName: team
          destination: TeamTable
          mapToDisplayName: Team
          prompt: A team is a set of contacts that you might be selling to at the same time.
          customFields:
            - mapToName: teamName
              mapToDisplayName: Team Name
```

The action above will produce the following set up UI:

![](https://files.readme.io/50859fa-image.png)
