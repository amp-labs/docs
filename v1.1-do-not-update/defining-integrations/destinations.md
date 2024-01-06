---
title: "Destinations"
slug: "destinations"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 23:19:58 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Wed Apr 12 2023 02:41:33 GMT+0000 (Coordinated Universal Time)"
---
The **destinations** key of `amp.yaml` defines destinations that data from [Read Actions](doc:integrations) and [Subscribe Actions](doc:subscribe-actions) should be sent to.

# Destinations for read actions

## Postgres

Ampersand can directly send data into a Postgres database that you give us access to. We recommend that you create a separate database from your main database for this purpose, and that your application only reads from this database and does not make any writes to it. Once you connect Ampersand to your Postgres database using the Management Console, you can define Postgres destinations to sync data to. 

```yaml
destinations:
  - name: salesforceAccountsTable
    type: postgres
    tableName: SalesforceAccounts
  - name: salesforceContactsTable
    type: postgres
    tableName: SalesforceContacts

integrations:
- name: read-accounts-and-contacts-from-salesforce
  api: salesforce
  actions:
    - type: read
      schedule: every 2 hours
      objects:
        - objectName: account
          destination: salesforceAccountsTable
          ...
        - objectName: contact
          destination: salesforceContactsTable
          ...
```

Each table will have the following columns:

| Column Name | Type   | Description                                                                                                                                                                              |
| :---------- | :----- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UID         | string | The [primary key](doc:glossary#primary-key) that the SaaS provider uses for this object type.                                                                                            |
| GroupId     | string | The ID for the customer [group](doc:glossary#group) that this data belongs to.                                                                                                           |
| Data        | JSONB  | All the fields that we have read. You can create your own [jsonb indexes](https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING) on the data to make querying easier. |

## Ampersand-hosted data store

Another destination for your customer's data is Ampersand's hosted data store. We'll store the data for you, and your application can access the data by calling endpoints we expose in a known format.

You define **endpoint** values in `amp.yaml`, and after you deploy, we'll expose endpoints in the format of:

`<ampersand_root_url>/<endpoint_value_you_defined_in_config>/<supported_paths>`

The Ampersand root URL is `https://store.withampersand.com/projects/` followed by your Ampersand project ID.

The supported paths are:

- `groups/group-id`: to get a list of all the items of this object type for a customer [group](doc:glossary#group) (e.g. all the accounts that a company has in Hubspot).
- `groups/group-id/items/item-id`: to get a particular item using its identifier, we'll use the  [primary key](doc:glossary#primary-key) that the SaaS provider uses for this object type.

Here's an example, let's say this was your `amp.yaml`:

```yaml
destinations:
  - name: hubspotAccountsApi
    type: api
    endpoint: hubspot-accounts
  - name: hubspotContactsApi
    type: api
    endpoint: hubspot-contacts

integrations:
- name: read-accounts-and-contacts-from-salesforce
  api: salesforce
  actions:
    - type: read
      schedule: every 2 hours
      objects:
        - objectName: account
          destination: hubspotAccountsApi
          ...
        - objectName: contact
          destination: hubspotContactsApi
          ...
```

If you deploy the file above, we'll expose the following endpoints:

```
GET https://store.withampersand.com/projects/<project-id>/hubspot-accounts/groups/<group-id>
GET https://store.withampersand.com/projects/<project-id>/hubspot-accounts/groups/<group-id>/items/<account-id>

GET https://store.withampersand.com/projects/<project-id>/hubspot-contacts/groups/<group-id>
GET https://store.withampersand.com/projects/<project-id>/hubspot-contacts/groups/<group-id>/items/<contact-id>
```

> 🗺️ On the roadmap
> 
> Other data store destinations such as Amazon S3, Databricks, Firestore, and BigQuery.

# Destinations for subscribe actions

## Webhook

When you define a webhook destination for a subscribe action, Ampersand will make a POST request to that webhook every time there's an event that you're interested in.

See [Subscribe Actions](doc:subscribe-actions) for the request body formats.

```yaml
destinations:
  - name: hubspotContactWebhook
    type: webhook
    url: webhooks.myapp.com/hubspot-contact-updated

integrations:
- name: watch-hubspot-contact-change
  api: hubspot
  actions:
    - type: notify
      standardObjects:
       - objectName: contact
         destination: hubspotContactWebhook
         event: update
         ...

```
