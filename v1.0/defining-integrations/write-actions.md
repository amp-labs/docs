---
title: "Write Actions"
slug: "write-actions"
excerpt: ""
hidden: false
---
A write action writes data to your customer's SaaS whenever you make an API request to us. To define a write action, add `write` as a key in your integration defined in `amp.yaml`, and add a list of standard and custom objects you want to write to.

```yaml
    write:
      objects:
        - objectName: account
        - objectName: contact
        - objectName: touchpoints__c # You can include custom objects
```

> 🗺️ On the roadmap
> 
> The ability to programmatically create custom objects when a user installs your integration.

# Write a single record

Once your users install an integration with a write action, your app can write data to their SaaS by making an API call to Ampersand, the URL is in the format of:

`https://write.withampersand.com/v1/projects/:projectId/integrations/:integrationId/objects/:objectName`

You can find your project ID and integration ID in the Ampersand Management Console (look in the address bar).

`objectName` refers to the `objectName` key within the `amp.yaml` file that defines your integration. This must match the name of an object that exists within the SaaS instance.

## Create a new record

To create a new record, make a request to the [Create record](ref:createrecord) endpoint. For example:

```
curl --location 'https://write.withampersand.com/v1/projects/66438162-5299-4669-a41d-85c5a3b1a83e/integrations/113e9685-9a51-42cc-8662-9d9725b17f14/objects/contact' \
--header 'X-Api-Key: JG4AWFAJC735QE5CINESB27KL72EHICNHARST4A' \
--header 'Content-Type: application/json' \
--data '{
    "groupRef": "demo-group-id",
    "record": {
        "FirstName": "Harry",
        "LastName": "Potter"
    }
}'
```

## Update an existing record

To update an existing record, you need to know the ID of the record, which is the ID that the SaaS provider uses to uniquely identify this record. If you created the record using Ampersand, this ID is available in the API response. If you are reading the record first using Ampersand's Read Actions, make sure you add the ID as a required field in the read action.

See the reference doc for [Update record](ref:updaterecord) endpoint for how to construct this request.

# Bulk write

If you are updating a large number of records, you can make bulk writes by calling our Write API endpoints, for example [Upsert records](ref:upsertrecordsasync). These are asynchronous endpoints, once your request has been successfully received, you'll get a response which contains an Operation ID. You can then use the [GetOperation](ref:getoperation) endpoint to poll on the status of this Operation, or view its status on the Ampersand Console.

At the moment, only bulk write to Salesforce is supported.

## Primary Key

For updates and upserts, you'll need to supply a `primaryKey`. This is the name of the field that should be used as an identifier when deciding whether to create a new record or update an existing record. For Salesforce, this can either be the default `id` field that exists on every object, or it can be an "External ID" field. This field must exist in the CSV, and must be specified in the API request.

## CSV Format

You can provide your data in one of 2 formats:

- A CSV string (max size 10 MiB)
- A public URL where the Ampersand server can make a GET request to retrieve a CSV file (max size of file is 150 MiB)

A few things to note regarding the format of the file when writing to Salesforce:

- Column headers must match the field names of the object in Salesforce. Please note that Salesforce requires `__c` at the end of all custom fields.
- Line endings must be `LF`, not `CRLF`. Unix-based systems and most libraries for generating CSV files would default to `LF` line endings already.
- Dates and timestamps must follow (Salesforce's specified format)[https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_valid_date_formats.htm].
 
Here is an example CSV:

```
custom_id__c,start_date__c,objective_type__c,daily_budget_amount__c
0,2023-11-20T11:36:22-08:00,WEBSITE_CONVERSION,50
1,2023-11-20T11:36:22-08:00,LEAD_GENERATION,10
2,2023-11-20T11:36:22-08:00,LEAD_GENERATION,10
```

## Sample Request

Here's a sample request for bulk upsert using the CSV file above, if the object to be written to is a custom object with the name `tactics__c`. (Please note that `primaryKey` must match one of the column names from the CSV file.)

```
curl --request PUT \
     --url https://write.withampersand.com/v1/projects/2234wf/integrations/23rsdf32/objects/tactics__c:async \
     --header 'X-Api-Key: YOUR_KEY' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '
{
  "groupRef": "sample-org-id",
  "recordsURL": "https://sample.com/data.csv",
  "primaryKey": "custom_id__c"
}
'
```

This is an example response you might receive from the request above:

```
{ "operationId": "5e4f06ca-445f-43ea-943e-78465ee1bb7a" }
```

If you want to get the status of this Operation, you can either look for it on the Ampersand Console, or you can make a request to the [GetOperation](ref:getoperation) endpoint. For example:

```
curl --request GET \
     --url https://api.withampersand.com/v1/projects/2234wf/operations/5e4f06ca-445f-43ea-943e-78465ee1bb7a \
     --header 'X-Api-Key: YOUR_KEY'
```

If the Operation has failed, you can get more details about the failure by retrieving the logs related to this Operation using the [ListOperationLogs](ref:listoperationlogs) endpoint. For example:

```
curl --request GET \
     --url https://api.withampersand.com/v1/projects/2234wf/operations/5e4f06ca-445f-43ea-943e-78465ee1bb7a/logs \
     --header 'X-Api-Key: YOUR_KEY'
```
