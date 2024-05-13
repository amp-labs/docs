---
title: "Deploy integrations"
slug: "deploy-integrations"
excerpt: ""
hidden: false
metadata: 
  image: []
  robots: "index"
createdAt: "Tue Apr 04 2023 23:18:25 GMT+0000 (Coordinated Universal Time)"
updatedAt: "Sun Oct 15 2023 05:45:33 GMT+0000 (Coordinated Universal Time)"
---
# Deploy your integrations

After defining your integrations in `amp.yaml`, deploy your changes by running the commands below. After your changes are deployed to the Ampersand servers, the UI components you've embedded into your app will automatically update to reflect the latest version of your integrations.

```text
amp login
amp deploy <folder_with_amp.yaml> --project=<project-id>
```

If you are running the Ampersand CLI in a CI/CD system, you can use your API key instead of the `login` command.

```text
amp deploy <folder_with_amp.yaml> --project=<project-id> --key=<api-key>

# Or you can put the API key in the AMP_API_KEY environment variable:
export AMP_API_KEY=<api-key>
amp deploy <folder_with_amp.yaml> --project=<project-id>
```
