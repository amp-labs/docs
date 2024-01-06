---
title: "Write Actions"
slug: "write-actions"
excerpt: ""
hidden: false
createdAt: "Thu Nov 30 2023 19:51:19 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Fri Dec 01 2023 16:57:18 GMT+0000 (Coordinated Universal Time)"
---
# Bulk Writes

If you are updating a large number of records, you can make bulk writes by calling our Write API endpoints, for example [Upsert records](https://docs.withampersand.com/v1.0/reference/upsertrecordsasync). These are asynchronous endpoints, once your request has been successfully received, you'll get a response which contains an Operation ID. You can then use the [GetOperation](https://docs.withampersand.com/v1.0/reference/getoperation) endpoint to poll on the status of this Operation, or view its status on the Ampersand Console.

## Primary Key

For updates and upserts, you'll need to supply a `primaryKey`. This is the name of the field that should be used as an identifier when deciding whether to create a new record or update an existing record. For Salesforce, this must be a field which is an "External ID" field.

## CSV Format

You can provide your data in one of 2 formats:

- a CSV string (max size 10 MiB)
- a public URL where the Ampersand server can make a GET request to retrieve a CSV file (max size of file is 150 MiB)

The headers of the CSV file must match the field names of the object in Salesforce. Please note that Salesforce requires `__c` at the end of all custom fields. Here is an example CSV file:

```
custom_id__c,start_date__c,objective_type__c,daily_budget_amount__c
0,2023-11-20T11:36:22-08:00,WEBSITE_CONVERSION,50
1,2023-11-20T11:36:22-08:00,LEAD_GENERATION,10
2,2023-11-20T11:36:22-08:00,LEAD_GENERATION,10
```

## Sample Request

Here's a sample request for bulk upsert using the CSV file above, if the object to be written to is a custom object with the name `tactics__c`. (Please note that `primaryKey` must match one of the column names from the CSV file.

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

If you want to get the status of this Operation, you can either look for it on the Ampersand Console, or you can make a request to the [GetOperation](https://docs.withampersand.com/v1.0/reference/getoperation) endpoint. When the write has completed, the Operation will have a status of `BulkWriteCompleted`.

```
curl --request GET \
     --url https://api.withampersand.com/v1/projects/2234wf/operations/5e4f06ca-445f-43ea-943e-78465ee1bb7a \
     --header 'X-Api-Key: YOUR_KEY' \     
     --header 'accept: application/json'
```
