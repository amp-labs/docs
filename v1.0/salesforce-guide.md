---
title: "Salesforce guide"
slug: "salesforce-guide"
excerpt: ""
hidden: true
metadata: 
  image: []
  robots: "index"
---

> ℹ️ Topics Covered in This Article
> 
> - [Getting Started](https://docs.withampersand.com/docs/salesforce-guide#before-you-get-started)  
> - [Creating a Salesforce Connected App](https://docs.withampersand.com/docs/salesforce-guide#creating-a-salesforce-connected-app) 
> - [Connecting Salesforce to Ampersand](https://docs.withampersand.com/docs/salesforce-guide#connecting--salesforce-to-ampersand)

<br />

## Before You Get Started

To integrate Salesforce with Ampersand, you need to [Create a Salesforce Account](https://docs.withampersand.com/docs/salesforce-guide#create-a-salesforce-account) and obtain the following credentials from a Salesforce Connected App:

- Consumer Key
- Consumer Secret

### Create a Salesforce Account

You need a Salesforce account to create integrations using Ampersand. If you do not have a Salesforce account, here's how you can sign up for a free Developer Account:

- Go to the [Salesforce Developer site](https://developer.salesforce.com/signup) and sign up for a free developer account.
- Fill in the required details and click on **Sign Me Up**.
- Verify your email and complete the registration process.

## Create a Salesforce Connected App

To create Salesforce integrations with Ampersand, you'll need to first create a Connected App in Salesforce. Follow the steps below:

1. Log in to your Salesforce account.

2. Navigate to the gear icon in the top right corner and select **Setup**.

   <br />

   [block:image]{"images":[{"image":["https://files.readme.io/e8dc5f2-setup.gif","This is some image...","Alt text"],"align":"center","border":true}]}[/block]

3. Go to **Platform Tools >> Apps >> App Manager**.

   [block:image]{"images":[{"image":["https://files.readme.io/9db9ed9-appmanager.gif","This is some image...","Alt text"],"align":"center","border":true}]}[/block]

4. Click **New Connected App** to create a new app.  

   [block:image]{"images":[{"image":["https://files.readme.io/54ead97-connectedapp.gif","This is some image...","Alt text"],"align":"center","border":true}]}[/block]

5. Enter  **Connected App Name**, **API Name**, and **Contact Email**.

6. Select the **Enable OAuth Settings** checkbox to configure the OAuth settings:

   1. Enter the **Callback URL**: `https://api.withampersand.com/callbacks/v1/oauth`
   2. Select the applicable OAuth Scopes from the list and click **Add**. You must always include the`Perform requests at any time (refresh_token, offline_access)` scope.
      > ✅ 
      > 
      > For more details on which OAuth scopes to include, refer to the [OAuth Tokens and Scopes](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_tokens_scopes.htm&language=en_US&type=5)   guide.
   3. Uncheck the **Require Proof Key for Code Exchange (PKCE) Extension for Supported Authorization Flows** checkbox.

      <br />

      [block:image]{"images":[{"image":["https://files.readme.io/fb527e1-oauth.gif","This is some image...","Alt text"],"align":"center","border":true}]}[/block]

7. Click **Save**.

### Obtain Consumer Key and Consumer Secret

Now that you have created a Connected App in Salesforce, you can obtain your Consumer Key and Consumer Secret. These credentials will be used in the next step, where you will [connect your application to Ampersand](https://docs.withampersand.com/docs/salesforce-guide#connecting--salesforce-to-ampersand) .

In the **Platform Tools >> Apps >> App Manager** section, find your newly created connected App and follow the steps below to obtain Consumer Key and Consumer Secret. 

1. Click the dropdown arrow next to your app and select **View**.
2. Click **Manage Consumer Details**.
3. Complete the verification and you will be able to access the **Consumer Key** and **Consumer Secret**. 

Copy these keys and use them in the next step to connect Salesforce to Ampersand.

## Provide Salesforce Connected App info to Ampersand

1. Log in to your [Ampersand Console](https://console.withampersand.com).

2. Select the project where you want to create a Salesforce integration.

   [block:image]{"images":[{"image":["https://files.readme.io/dd47b7a-Ampersand.png","This is some image...","Alt text"],"align":"center","border":true}]}[/block]

3. Select **Provider apps**.

4. Select _Salesforce_ from the **Provider** list. 

5. Enter the previously obtained _Consumer Key_ in the **Client ID** field and the _Consumer Secret_ in the **Client Secret** field.

   <br />

   [block:image]{"images":[{"image":["https://files.readme.io/eb0711b-clientid.gif","This is some image...","Alt text"],"align":"center","border":true}]}[/block]

<br />

> ℹ️ 
> 
> If you lose these keys, you can regenerate them by editing the Connected App in Salesforce and selecting **Regenerate Consumer Secret**.
