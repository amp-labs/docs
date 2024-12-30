import platformApiPages from "./reference/platform.json";
import readApiPages from "./reference/read.json";
import writeApiPages from "./reference/write.json";
import fs from "fs";
import matter from 'gray-matter';

// These declare the OpenAPI specs that are used to generate the API reference pages. They come in handy
// when we have similar paths across different endpoints / specs. For example, the `read` and `write` specs have
// the same POST path for on-demand read & write.
const openApiPlatform = "api";
const openApiRead = "read";
const openApiWrite = "write";

export interface MintConfig {
  name?: string;
  // OpenAPI specs to refer to for all pages in this group. Used by mintlify to generate the API reference pages. Needs
  // to be here to be able to refer to them in pages.
  openapi?: Array<string>;
  logo?: {
    light?: string;
    dark?: string;
  };
  favicon?: string;
  colors?: {
    primary?: string;
    light?: string;
    dark?: string;
  };
  topbarLinks?: Array<{
    name?: string;
    url?: string;
  }>;
  tabs?: Array<{
    name?: string;
    url?: string;
  }>;
  topbarCtaButton?: {
    name?: string;
    url?: string;
  };
  anchors?: Array<{
    name?: string;
    icon?: string;
    url?: string;
  }>;

  feedback?: {
    thumbsRating?: boolean;
    suggestEdit?: boolean;
    raiseIssue?: boolean;
  }

  navigation: NavigationGroup[];
  backgroundImage?: string;
  footerSocials?: {
    github?: string;
    discord?: string;
    twitter?: string;
    linkedin?: string;
  };
  analytics?: {
    posthog?: {
      apiKey?: string;
    };
  };
  [key: string]: unknown;
}

const mintConfig: MintConfig = {
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
  "redirects": [
    {
      "source": "/docs/:slug*",
      "destination": "/:slug*"
    },
    {
      "source": "/docs/read-actions",
      "destination": "/define-integrations/read-actions"
    },
    {
      "source": "/docs/write-actions",
      "destination": "/define-integrations/write-actions"
    },
    {
      "source": "/docs/proxy-actions",
      "destination": "/define-integrations/proxy-actions"
    },
    {
      "source": "/docs/subscribe-actions",
      "destination": "/define-integrations/subscribe-actions"
    },
    {
      "source": "/glossary",
      "destination": "/terminology"
    },
  ],
  tabs: [
    {
      name: "API Reference",
      url: "reference",
    },
  ],

  navigation: [
    {
      group: "",
      pages: [
        "overview",
        "quickstart",
        "concepts",
        {
          group: "Define integrations",
          pages: [
            "define-integrations/overview",
            "define-integrations/read-actions",
            "define-integrations/write-actions",
            "define-integrations/proxy-actions",
            "define-integrations/subscribe-actions",
          ],
        },
        "object-and-field-mappings",
        "embeddable-ui-components",
        {
          group: "CLI",
          pages: [
            "cli/overview",
            "cli/reference"
          ]
        },
        {
          group: "Destinations",
          pages: [
              "destinations/overview",
              "destinations/webhooks",
          ]
        },
        "terminology",
        {
          group: "Provider guides",
          pages: [
            "provider-guides/overview",
            "provider-guides/acuityScheduling",
            "provider-guides/aha",
            "provider-guides/aircall",
            "provider-guides/airtable",
            "provider-guides/anthropic",
            "provider-guides/apollo",
            "provider-guides/asana",
            "provider-guides/ashby",
            "provider-guides/atlassian",
            "provider-guides/attio",
            "provider-guides/aweber",
            "provider-guides/bird",
            "provider-guides/blueshift",
            "provider-guides/blueshiftEU",
            "provider-guides/box",
            "provider-guides/brevo",
            "provider-guides/bynder",
            "provider-guides/calendly",
            "provider-guides/campaignMonitor",
            "provider-guides/capsule",
            "provider-guides/chartMogul",
            "provider-guides/clari",
            "provider-guides/clickup",
            "provider-guides/close",
            "provider-guides/constantContact",
            "provider-guides/copper",
            "provider-guides/crunchbase",
            "provider-guides/customerJourneysApp",
            "provider-guides/customerJourneysTrack",
            "provider-guides/delighted",
            "provider-guides/discord",
            "provider-guides/dixa",
            "provider-guides/docusign",
            "provider-guides/drift",
            "provider-guides/dropbox",
            "provider-guides/dropboxsign",
            "provider-guides/dynamicsBusinessCentral",
            "provider-guides/dynamicsCRM",
            "provider-guides/facebook",
            "provider-guides/figma",
            "provider-guides/formstack",
            "provider-guides/front",
            "provider-guides/g2",
            "provider-guides/geckoboard",
            "provider-guides/getResponse",
            "provider-guides/gitlab",
            "provider-guides/gong",
            "provider-guides/google",
            "provider-guides/gorgias",
            "provider-guides/guru",
            "provider-guides/helpScoutMailbox",
            "provider-guides/hive",
            "provider-guides/hubspot",
            "provider-guides/insightly",
            "provider-guides/instantly",
            "provider-guides/intercom",
            "provider-guides/ironclad",
            "provider-guides/iterable",
            "provider-guides/jira",
            "provider-guides/jotform",
            "provider-guides/keap",
            "provider-guides/kit",
            "provider-guides/klaviyo",
            "provider-guides/linkedin",
            "provider-guides/lemlist",
            "provider-guides/mailgun",
            "provider-guides/marketo",
            "provider-guides/microsoft",
            "provider-guides/miro",
            "provider-guides/mixmax",
            "provider-guides/monday",
            "provider-guides/mural",
            "provider-guides/notion",
            "provider-guides/nutshell",
            "provider-guides/openAI",
            "provider-guides/outreach",
            "provider-guides/paddle",
            "provider-guides/paddleSandbox",
            "provider-guides/pinterest",
            "provider-guides/pipedrive",
            "provider-guides/pipeliner",
            "provider-guides/podium",
            "provider-guides/productboard",
            "provider-guides/rebilly",
            "provider-guides/recurly",
            "provider-guides/salesforce",
            "provider-guides/salesloft",
            "provider-guides/seismic",
            "provider-guides/sellsy",
            "provider-guides/sendGrid",
            "provider-guides/serviceNow",
            "provider-guides/slack",
            "provider-guides/smartlead",
            "provider-guides/smartsheet",
            "provider-guides/snapchatAds",
            "provider-guides/surveyMonkey",
            "provider-guides/teamleader",
            "provider-guides/teamwork",
            "provider-guides/timely",
            "provider-guides/webflow",
            "provider-guides/wordpress",
            "provider-guides/wrike",
            "provider-guides/zendeskSupport",
            "provider-guides/zoho",
            "provider-guides/zohoDesk",
            "provider-guides/zoom"
          ],
        },
        "dev-and-prod-environments"
      ],
    },
    {
      group: "Authentication",
      pages: [
        "reference/auth",
      ],
    },
    {
      group: "WRITE API",
      openapiSource: openApiWrite,
      pages: writeApiPages,
    },
    {
      group: "READ API",
      openapiSource: openApiRead,
      pages: readApiPages,
    },
    {
      group: "PLATFORM API",
      openapiSource: openApiPlatform,
      pages: platformApiPages,
    },
  ],

  footerSocials: {
    linkedin: "https://www.linkedin.com/company/withampersand",
    twitter: "https://twitter.com/withampersand",
  },

  feedback: {
    thumbsRating: true,
    suggestEdit: true,
    raiseIssue: true,
  }
};

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

const jsonStringifyReplacer = function (key: string, val: any) {
  if (key !== 'openapiSource') {
    return val;
  }
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


// Main script
try {
  const outPath = process.argv[2];
  if (outPath) {
    console.log(`[${new Date().toISOString()}] Writing mint config to ${outPath}`);

    // Traverse the navigation groups and update autogenerated pages with OpenAPI references
    mintConfig.navigation.forEach((group) =>
        traverseNavigationGroups(group, addOpenapiSource, null)
    );

    fs.writeFileSync(outPath, JSON.stringify(mintConfig, jsonStringifyReplacer, 2));
  } else {
    console.log(JSON.stringify(mintConfig, jsonStringifyReplacer));
  }
} catch (error) {
  console.log('error generating mintlify config', error);
}
