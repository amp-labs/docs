---
title: "Deploy integrations"
slug: "deploy-integrations"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 23:18:25 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Wed Apr 12 2023 03:17:57 GMT+0000 (Coordinated Universal Time)"
---
After defining your integrations in `amp.yaml`, deploy your changes using the **amp CLI**. After your changes are deployed to the Ampersand servers, the UI components you've embedded into your app will automatically update to reflect the latest version of your integrations.

You must run the deploy command from a directory with the `amp` folder, which contains `amp.yaml` and any code files for transformation functions. See [Define integrations](doc:defining-integrations) for the directory structure. 

```text
# Log in with your Ampersand account
amp login

# Select the Ampersand project you are deploying to
amp use my-project-id

# Deploy your integrations
amp deploy
```
