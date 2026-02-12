import { writeFileSync } from 'fs';
import { join } from 'path';
import platformApiPages from "./reference/platform.json";
import readApiPages from "./reference/read.json";
import writeApiPages from "./reference/write.json";
import matter from 'gray-matter';
import fs from "fs";

// These declare the OpenAPI specs that are used to generate the API reference pages. They come in handy
// when we have similar paths across different endpoints / specs. For example, the `read` and `write` specs have
// the same POST path for on-demand read & write.
const openApiPlatform = "platform";
const openApiRead = "read";
const openApiWrite = "write";

export interface DocsConfig {
  $schema: string;
  theme: string;
  name: string;
  colors?: {
    primary?: string;
    light?: string;
    dark?: string;
  };
  favicon?: string;
  navigation: {
    tabs: Array<{
      tab: string;
      groups: Array<NavigationGroup>;
    }>;
  };
  logo?: {
    light?: string;
    dark?: string;
    href?: string;
  };
  api?: {
    openapi?: Array<string>;
  };
  navbar?: {
    links?: Array<{
      label: string;
      href: string;
    }>;
    primary?: {
      type: string;
      label: string;
      href: string;
    };
  };
  footer?: {
    socials?: {
      github?: string;
      discord?: string;
      twitter?: string;
      linkedin?: string;
    };
  };
  redirects?: Array<{
    source: string;
    destination: string;
  }>;
}

interface NavigationGroup {
  group: string;
  pages: Array<string | NavigationGroup>;

  // OpenAPI spec to refer to for all methods in this group. This is helpful to avoid collisions when we have similar
  // paths across different endpoints / specs. For example, the `read` and `write` specs have the same POST path for
  // on-demand read & write. It is also a script property, so we omit it when the config is jsonified, because the rest
  // of the config is what Mintlify consumes. If you decide to modify this field, you'll need to update the JSON.Stringify
  // replacer below. Read more at https://mintlify.com/docs/api-playground/openapi/setup#manually-specify-files
  openapiSource?: string;
}


// Convert navigation array to DocsConfig navigation format
function convertNavigation(mintNavigation: Array<any>): Array<NavigationGroup> {
  return mintNavigation.map(group => {
    if (typeof group === 'string') {
      return {
        group: '',
        pages: [group]
      };
    }
    return {
      group: group.group,
      pages: Array.isArray(group.pages) ? group.pages.map((page: any) => {
        if (typeof page === 'string') {
          return page;
        }
        return {
          group: page.group,
          pages: page.pages
        };
      }) : []
    };
  });
}

// Main function to generate docs.json
export function generateDocsConfig(mintConfig: any): DocsConfig {
  const docsConfig: DocsConfig = {
    $schema: 'https://mintlify.com/docs.json',
    theme: 'mint',
    name: mintConfig.name,
    colors: mintConfig.colors,
    favicon: mintConfig.favicon,
    navigation: {
      tabs: [
        {
          tab: 'Documentation',
          groups: convertNavigation(mintConfig.navigation.filter((group: any) =>
            !group.group.match(/^(Introduction|WRITE API|READ API|PLATFORM API)$/)))
        },
        {
          tab: 'API Reference',
          groups: convertNavigation(mintConfig.navigation.filter((group: any) =>
            group.group.match(/^(Introduction|WRITE API|READ API|PLATFORM API)$/)))
        }
      ]
    },
    logo: mintConfig.logo,
    api: {
      openapi: ['./platform.json', './read.json', './write.json']
    },
    navbar: {
      links: mintConfig.topbarLinks?.map((link: any) => ({
        label: link.name,
        href: link.url
      })),
      primary: mintConfig.topbarCtaButton ? {
        type: 'button',
        label: mintConfig.topbarCtaButton.name,
        href: mintConfig.topbarCtaButton.url
      } : undefined
    },
    footer: {
      socials: mintConfig.footerSocials
    },
    redirects: mintConfig.redirects
  };

  return docsConfig;
}

// Function to write docs.json
export function writeDocsJson(docsConfig: DocsConfig, outputPath: string = 'docs.json'): void {
  const jsonContent = JSON.stringify(docsConfig, null, 2);
  writeFileSync(join(__dirname, outputPath), jsonContent);
  console.log(`Generated ${outputPath} successfully!`);
}

// Create the base configuration
const baseConfig = {
  name: "Ampersand",
  openapi: [openApiPlatform, openApiRead, openApiWrite],
  logo: {
    light: "/logos/dark.png",
    dark: "/logos/light.png",
    href: "https://withampersand.com"
  },
  favicon: "logos/favicon.svg",
  colors: {
    primary: "#4F1EB8",
    light: "#A67CFF",
    dark: "#6122E7",
  },
  topbarCtaButton: {
    name: "Start building now",
    url: "https://dashboard.withampersand.com/sign-up",
  },
  topbarLinks: [
    {
      name: "Sign in",
      url: "https://dashboard.withampersand.com/sign-in",
    },
  ],
  redirects: [
    {
      source: "/docs/:slug*",
      destination: "/:slug*"
    },
    {
      source: "/docs/read-actions",
      destination: "/read-actions"
    },
    {
      source: "/docs/write-actions",
      destination: "/write-actions"
    },
    {
      source: "/docs/proxy-actions",
      destination: "/proxy-actions"
    },
    {
      "source": "/defining-integrations",
      "destination": "/quickstart"
    },
    {
      source: "/define-integrations/read-actions",
      destination: "/read-actions"
    },
    {
      source: "/define-integrations/write-actions",
      destination: "/write-actions"
    },
    {
      source: "/define-integrations/proxy-actions",
      destination: "/proxy-actions"
    },
    {
      source: "/define-integrations/subscribe-actions",
      destination: "/subscribe-actions"
    },
    {
      source: "/glossary",
      destination: "/terminology"
    },
    {
      source: "/jwt-auth",
      destination: "/api/jwt-auth"
    },
    {
      source: "/reference/auth",
      destination: "/api/key-auth"
    },
    {
      source: "/detect-schema-changes",
      destination: "/manage-customer-schemas"
    }
  ],
  footerSocials: {
    linkedin: "https://www.linkedin.com/company/withampersand",
    twitter: "https://twitter.com/withampersand",
  },
  navigation: [
    {
      // In order for the group headers on the documentation tab to not be bolded,
      // we need to nest all of them in a mega-group, but this mega-group shouldn't have a group name.
      group: " ", // This is intentionally left empty, DO NOT MODIFY.
      pages: [
        {
          group: "Get started",
          pages: [
            "overview",
            "concepts",
            "quickstart",
            // "use-with-ai-ide",
            "unified-api"
          ]
        },
        "subscribe-actions",
        "read-actions",
        "write-actions",
        "proxy-actions",
        "object-and-field-mapping",
        "manage-customer-schemas",
        {
          group: "UI library",
          pages: [
            "embeddable-ui-components",
            "headless"
          ]
        },
        {
          group: "CLI",
          pages: [
            "cli/overview",
            "cli/reference"
          ]
        },
        "manifest-reference",
        {
          group: "Destinations",
          pages: [
            "destinations/overview",
            "destinations/webhooks",
            "destinations/kinesis",
          ]
        },
        {
          group: "Notifications",
          pages: [
            "notifications/overview",
            "notifications/notification-payloads"
          ]
        },
        {
          group: "Provider guides",
          pages: [
            "provider-guides/overview",
            "provider-guides/acuityScheduling",
            "provider-guides/aha",
            "provider-guides/aircall",
            "provider-guides/airtable",
            "provider-guides/amplemarket",
            "provider-guides/amplitude",
            "provider-guides/anthropic",
            "provider-guides/apollo",
            "provider-guides/asana",
            "provider-guides/ashby",
            "provider-guides/atlassian",
            "provider-guides/attio",
            "provider-guides/avoma",
            "provider-guides/aweber",
            "provider-guides/aws",
            "provider-guides/bird",
            "provider-guides/bitbucket",
            "provider-guides/blackbaud",
            "provider-guides/blueshift",
            "provider-guides/blueshiftEU",
            "provider-guides/box",
            "provider-guides/braintree",
            "provider-guides/braze",
            "provider-guides/breakcold",
            "provider-guides/brevo",
            "provider-guides/bynder",
            "provider-guides/calendly",
            "provider-guides/campaignMonitor",
            "provider-guides/capsule",
            "provider-guides/chargeOver",
            "provider-guides/chargebee",
            "provider-guides/chartMogul",
            "provider-guides/chilipiper",
            "provider-guides/chorus",
            "provider-guides/clari",
            "provider-guides/clariCopilot",
            "provider-guides/clickup",
            "provider-guides/close",
            "provider-guides/coda",
            "provider-guides/constantContact",
            "provider-guides/copper",
            "provider-guides/crunchbase",
            "provider-guides/customerJourneysApp",
            "provider-guides/customerJourneysTrack",
            "provider-guides/delighted",
            "provider-guides/discord",
            "provider-guides/discourse",
            "provider-guides/dixa",
            "provider-guides/docusign",
            "provider-guides/domo",
            "provider-guides/drift",
            "provider-guides/dropbox",
            "provider-guides/dropboxsign",
            "provider-guides/dynamicsBusinessCentral",
            "provider-guides/dynamicsCRM",
            "provider-guides/emailBison",
            "provider-guides/fathom",
            "provider-guides/figma",
            "provider-guides/fireflies",
            "provider-guides/flatfile",
            "provider-guides/formstack",
            "provider-guides/freshchat",
            "provider-guides/freshdesk",
            "provider-guides/front",
            "provider-guides/g2",
            "provider-guides/geckoboard",
            "provider-guides/getResponse",
            "provider-guides/github",
            "provider-guides/gitlab",
            "provider-guides/goTo",
            "provider-guides/gong",
            "provider-guides/google",
            "provider-guides/gorgias",
            // "provider-guides/greenhouseJobBoard",
            "provider-guides/groove",
            "provider-guides/guru",
            "provider-guides/happyfox",
            "provider-guides/helpScoutMailbox",
            "provider-guides/heyreach",
            "provider-guides/highlevel",
            "provider-guides/hightouch",
            "provider-guides/hive",
            "provider-guides/hubspot",
            "provider-guides/hunter",
            "provider-guides/insightly",
            "provider-guides/instantly",
            "provider-guides/intercom",
            "provider-guides/ironclad",
            "provider-guides/iterable",
            "provider-guides/jira",
            "provider-guides/jobber",
            "provider-guides/joinMe",
            "provider-guides/jotform",
            "provider-guides/kaseyaVSAX",
            "provider-guides/keap",
            "provider-guides/kit",
            "provider-guides/klaviyo",
            "provider-guides/lemlist",
            "provider-guides/lever",
            "provider-guides/linear",
            "provider-guides/linkedin",
            "provider-guides/livestorm",
            "provider-guides/loxo",
            "provider-guides/mailgun",
            "provider-guides/marketo",
            "provider-guides/meta",
            "provider-guides/microsoft",
            "provider-guides/miro",
            "provider-guides/mixmax",
            "provider-guides/mixpanel",
            "provider-guides/monday",
            "provider-guides/mural",
            "provider-guides/netsuite",
            "provider-guides/notion",
            "provider-guides/nutshell",
            "provider-guides/openAI",
            "provider-guides/outplay",
            "provider-guides/outreach",
            "provider-guides/paddle",
            "provider-guides/paddleSandbox",
            "provider-guides/phoneBurner",
            "provider-guides/pinterest",
            "provider-guides/pipedrive",
            "provider-guides/pipeliner",
            "provider-guides/podium",
            "provider-guides/productBoard",
            "provider-guides/pylon",
            "provider-guides/quickbooks",
            "provider-guides/ramp",
            "provider-guides/rebilly",
            "provider-guides/recurly",
            "provider-guides/ringCentral",
            "provider-guides/sageIntacct",
            "provider-guides/salesfinity",
            "provider-guides/salesflare",
            "provider-guides/salesforce",
            "provider-guides/salesloft",
            "provider-guides/superSend",
            "provider-guides/segment",
            "provider-guides/seismic",
            "provider-guides/sellsy",
            "provider-guides/sendGrid",
            "provider-guides/serviceNow",
            "provider-guides/slack",
            "provider-guides/smartlead",
            "provider-guides/smartsheet",
            "provider-guides/snapchatAds",
            "provider-guides/shopify",
            "provider-guides/snowflake",
            "provider-guides/solarwindsServiceDesk",
            "provider-guides/stripe",
            "provider-guides/superSend",
            "provider-guides/surveyMonkey",
            "provider-guides/talkdesk",
            "provider-guides/teamleader",
            "provider-guides/teamwork",
            "provider-guides/timely",
            "provider-guides/tipalti",
            "provider-guides/vtiger",
            "provider-guides/webflow",
            "provider-guides/whereby",
            "provider-guides/wordpress",
            "provider-guides/wrike",
            "provider-guides/xero",
            "provider-guides/zendeskSupport",
            "provider-guides/zoho",
            "provider-guides/zoom",
          ]
        },
        {
          group: "Customer guides",
          pages: [
            "customer-guides/overview",
            "customer-guides/salesforce",
            "customer-guides/loxo",
            "customer-guides/hubspot",
            "customer-guides/marketo",
            "customer-guides/snowflake",
            "customer-guides/update-connection"
          ]
        },
        "dev-and-prod-environments",
        "terminology",
        {
          group: "AI Agents",
          pages: [
            "ai-sdk",
            "mcp-server",
          ]
        },
      ],
    },
    {
      group: "Introduction",
      pages: [
        "api/overview",
        "api/key-auth",
        "api/jwt-auth",
      ],
    },
    {
      group: "WRITE API",
      pages: writeApiPages,
      openapiSource: openApiWrite,
    },
    {
      group: "READ API",
      pages: readApiPages,
      openapiSource: openApiRead,
    },
    {
      group: "PLATFORM API",
      pages: platformApiPages,
      openapiSource: openApiPlatform,
    },
  ]
};

// This function traverses the navigation groups and runs a function on each page.
const traverseNavigationGroups = (
  group: NavigationGroup,
  processPage: (pagePath: string, groupOpenapiSource: string | undefined) => void,
  openapiSource?: string
) => {
  const groupOpenapiSource = group.openapiSource || openapiSource;

  group.pages.forEach((page) => {
    if (typeof page === "string") {
      processPage(page, groupOpenapiSource);
    } else if (typeof page === "object") {
      traverseNavigationGroups(page, processPage, groupOpenapiSource);
    }
  });
};


// This function reads the content of the page, and prefixes the openapi directive with the source.
const addOpenapiSource = (pagePath: string, groupOpenapiSource: string | undefined) => {
  try {
    const pageContent = fs.readFileSync(`${pagePath}.mdx`, "utf-8");
    const { data, content } = matter(pageContent);

    // Check if the page has an openapi directive, else no-op
    if (data.openapi) {
      const fields = data.openapi.split(" ");

      // Check if the page content is `openapi: <method> <path>`
      if (fields.length === 2) {
        // We need to specify which open api spec to use to find the method and path
        const [method, path] = fields;
        const newOpenapi = `${groupOpenapiSource || ""} ${method} ${path}`.trim();
        data.openapi = newOpenapi;
      } else if (fields.length === 3) {
        // We need to correct the openapi value if the group is different
        const [existingGroup, method, path] = fields;

        if (existingGroup !== groupOpenapiSource) {
          const newOpenapi = `${groupOpenapiSource || ""} ${method} ${path}`.trim();
          data.openapi = newOpenapi;
        }
      } else {
        // If the openapi field is not in the expected format, log an error and skip the page
        console.error(`Unexpected openapi field format for: ${pagePath}.mdx, skipping`);
      }

      const updatedFileContent = matter.stringify(content, data);
      fs.writeFileSync(`${pagePath}.mdx`, updatedFileContent, "utf-8");
    }
  } catch (error) {
    console.error(`Error processing page: ${pagePath}.mdx`, error);
  }
};



// If running directly
if (require.main === module) {
  try {
    const outPath = process.argv[2];
    if (outPath) {
      console.log(`[${new Date().toISOString()}] Writing docs config to ${outPath}`);
      const docsConfig = generateDocsConfig(baseConfig);

      // Traverse the navigation groups and update autogenerated pages with OpenAPI references
      baseConfig.navigation.forEach((group) =>
        traverseNavigationGroups(group, addOpenapiSource)
      );

      writeDocsJson(docsConfig, outPath);
    } else {
      const docsConfig = generateDocsConfig(baseConfig);
      console.log(JSON.stringify(docsConfig, null, 2));
    }
  } catch (error) {
    console.log('error generating docs config', error);
  }
}