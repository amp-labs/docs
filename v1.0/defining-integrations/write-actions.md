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

## Primary key

For updates and upserts, you'll need to supply a `primaryKey`. This is the name of the field that should be used as an identifier when deciding whether to create a new record or update an existing record. For Salesforce, this can either be the default `id` field that exists on every object, or it can be an "External ID" field. This field must exist in the CSV, and must be specified in the API request.

## Format the data

Salesforce bulk writes and bulk deletes expect data in CSV format. A few things to note regarding the CSV format when writing to Salesforce:

- Column headers must match the field names of the object in Salesforce. Please note that Salesforce requires `__c` at the end of all custom fields.
- Line endings must be `LF`, not `CRLF`. Unix-based systems and most libraries for generating CSV files would default to `LF` line endings already.
- Dates and timestamps must follow [Salesforce's specified format](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_valid_date_formats.htm).
 
Here is an example CSV:

```
custom_id__c,start_date__c,objective_type__c,daily_budget_amount__c
0,2023-11-20T11:36:22-08:00,WEBSITE_CONVERSION,50
1,2023-11-20T11:36:22-08:00,LEAD_GENERATION,10
2,2023-11-20T11:36:22-08:00,LEAD_GENERATION,10
```

## Send the data to Ampersand

You can provide your data in one of 3 ways:

- Method 1: a CSV string
- Method 2: a public URL
- Method 3: using an upload URL

### Method 1: CSV string

You can directly add CSV data to the `recordsCSV` field of the request body. The max limit for this 10 MiB.

### Method 2: public URL

In the `recordsURL` field of the request body, you can provide a public URL where the Ampersand server can make a GET request to retrieve a CSV file (max size of file is 150 MiB). The URL should start with `https://`. 

Here is an example request for bulk upsert using the CSV file above, if the object to be written to is a custom object with the name `tactics__c`. (Please note that `primaryKey` must match one of the column names from the CSV file.)

```
curl --request PUT \
     --url https://write.withampersand.com/v1/projects/2234wf/integrations/23rsdf32/objects/tactics__c:async \
     --header 'X-Api-Key: YOUR_AMPERSAND_KEY' \
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

### Method 3: using an Ampersand upload URL

Using an upload URL is a multi-step process where you upload CSV data to the Ampersand server using a temporary signed URL, and then make a subsequent request for the bulk write.

#### Step 1: generate an upload URL

Make a request to the [GenerateUploadURL](ref:generateuploadurl-1) endpoint:

```
curl --request GET \
     --url https://write.withampersand.com/v1/generate-upload-url \
     --header 'X-Api-Key: YOUR_AMPERSAND_KEY'
```

You'll get a response like the following:

```
{
  "url": "https://storage.googleapis.com/ampersand-prod-write-data/example?foo=bar",
  "reference":"gs://ampersand-dev-write-data/2024/04/05/096b495a-8042-4ea7-a19f-4280a6ee84d0.csv"
}
```

#### Step 2: make a request to the upload URL with CSV data

Next, make a PUT request to the `url` returned from the previous request, with CSV data as the content. Please note that upload URLs are only valid for 15 minutes after they are generated.

Here is a command line example. Please note that it uses [jq](https://jqlang.github.io/jq/download/) for JSON deserialization (otherwise the upload URL will have unicode escape characters, which the subsequent `curl` request will not work well with.) When you are making requests in code, you do not have to worry about this since the request library in your language of choice should handle JSON deserialization.

```
# Save the results from generateUploadURL in a file called result.json
curl -H "X-Api-Key: YOUR_AMPERSAND_KEY" https://write.withampersand.com/v1/generate-upload-url > result.json

# Use jq to extract and deserialize the upload URL, and save in a shell variable
URL=$(jq -r .url result.json)

# Upload a local file called `data.csv`
curl -X PUT -H "Content-Type: text/csv" --upload-file data.csv "$URL"
```

#### Step 3: make a request to start a bulk write

The response from the [GenerateUploadURL](ref:generateuploadurl-1) endpoint from step 1 should include a `reference` field which is a URL that starts with `gs://`. Put this URL in the `recordsURL` field of a bulk write request.

Here is an example request for bulk upsert, if the object to be written to is a custom object with the name `tactics__c`. (Please note that `primaryKey` must match one of the column names from the CSV file that was uploaded)

```
curl --request PUT \
     --url https://write.withampersand.com/v1/projects/2234wf/integrations/23rsdf32/objects/tactics__c:async \
     --header 'X-Api-Key: YOUR_AMPERSAND_KEY' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '
{
  "groupRef": "sample-org-id",
  "recordsURL": "gs://ampersand-dev-write-data/2024/04/05/096b495a-8042-4ea7-a19f-4280a6ee84d0.csv",
  "primaryKey": "custom_id__c"
}
'
```

## Get the status of a bulk write operation

Because bulk writes are asynchronous operations, you'll get back an Operation ID from the API, for example:

```
{ "operationId": "5e4f06ca-445f-43ea-943e-78465ee1bb7a" }
```

If you want to get the status of this Operation, you can either look for it on the Ampersand Console, or you can make a request to the [GetOperation](ref:getoperation) endpoint. For example:

```
curl --request GET \
     --url https://api.withampersand.com/v1/projects/2234wf/operations/5e4f06ca-445f-43ea-943e-78465ee1bb7a \
     --header 'X-Api-Key: YOUR_AMPERSAND_KEY'
```

If the Operation has failed, you can get more details about the failure by retrieving the logs related to this Operation using the [ListOperationLogs](ref:listoperationlogs) endpoint. For example:

```
curl --request GET \
     --url https://api.withampersand.com/v1/projects/2234wf/operations/5e4f06ca-445f-43ea-943e-78465ee1bb7a/logs \
     --header 'X-Api-Key: YOUR_AMPERSAND_KEY'
```
