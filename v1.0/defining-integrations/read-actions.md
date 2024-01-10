---
title: "Read Actions"
slug: "read-actions"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 23:19:50 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Oct 27 2023 17:00:20 GMT+0000 (Coordinated Universal Time)"
---
A read action reads data from your customer's SaaS on a scheduled basis and send them to Destinations that you define.

```yaml
  read:
      standardObjects:
        ...
```

# Read standard objects

To read a standard object, you need to specify:

- **objectName:** to indicate which standard object you'd like to read. This should match the name of the object in the official documentation for the SaaS API.
- **destination: **the name of the [destination](docs:destinations) that you've defined
- **schedule: **how frequently the read should happen. This value must be a schedule in [cron syntax](https://docs.gitlab.com/ee/topics/cron/)
- a list of fields

```yaml
      standardObjects:
        - objectName: lineItem
          destination: lineItemWebhook
          schedule: "0 */12 * * *" # every 12 hours
          ...
```

> 🗺️ On the roadmap
> 
> The ability for your users to define their own sync schedules.

## Known fields

Fields can be either be required or optional. If a field is required, then all users who install this integration will need to give your app read access to that field. If a field is optional, then users can choose whether they'd like your app to read that field. For standard fields, you will specify:

- **fieldName: ** the name of the field from the official SaaS API documentation, converted to lower case. For example, if you'd like to read the first name of a contact, write `firstname`.

```yaml
      standardObjects:
        - objectName: contact
          destination: contactWebhook
          schedule: "0 */12 * * *" # every 12 hours
          requiredFields:
          - fieldName: firstname
          - fieldName: lastname
          - fieldName: email
          optionalFields:
          - fieldName: company
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


## Allow users to pick from all fields

If you want to give your user the option to pick from any of the fields in their Object, use `optionalFieldsAuto: all`. The UI component will populate a list of all the fields pulled from their object and allow them to pick which ones your app will be able to read.

```yaml
      standardObjects:
        - objectName: contact
          destination: contactWebhook
          schedule: "0 */12 * * *" # every 12 hours
          requiredFields:
          - fieldName: firstname
          - fieldName: lastname
          - fieldName: email
          # All other fields are optional
          optionalFieldsAuto: all
```

## Field mappings

You might want to ask your users during the set up of the integration to map a field (standard or custom) to a concept in your product, because your various customers might be using different fields for the same purpose. Field mappings can either be inside `requiredFields` or `optionalFields`.

For these fields, you'll specify:

- **mapToName:** when we deliver the data from this field to you, this is the name that we'll use to identify the field. 
- **mapToDisplayName:** the phrasing to display to the user in the set up UI component when asking them to select a custom field (e.g. For the config below, the helper text will say, "Which of your custom fields map to Contact Notes?")
- **default** (optional): the default field, you should only use standard fields as defaults.
- **prompt** (optional): additional context that you want to show your user in the set up UI Component about this field. This should be a full sentence.

```yaml
      standardObjects:
        - objectName: contact
          destination: contactWebhook
          optionalFields:
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


# Example read action

```yaml yaml
integrations: 
 - name: readSalesforce
   api: salesforce
   read:
     standardObjects:
      
      - objectName: account
        destination: accountWebhook
        schedule: "0 */12 * * *" # every 12 hours
        requiredFields: 
        - fieldName: name
        - fieldName: industry
        optionalFields:
        - fieldName: annualrevenue
        - fieldName: website
              
      - objectName: contact
        destination: contactWebhook
        schedule: "0 */12 * * *" # every 12 hours
        requiredFields:
          - fieldName: firstname
          - fieldName: lastname
          - fieldName: email
          - mapToName: pronoun
            mapToDisplayName: Pronoun
            prompt: We will use this word when addressing this person in emails we send out.
        optionalFieldsAuto: all
      
```
