import platformApiPages from "./api-reference/platform.json";
import readApiPages from "./api-reference/read.json";
import writeApiPages from "./api-reference/write.json";
import fs from "fs";

export interface MintConfig {
  name?: string;
  openapi?: string;
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
  logo: {
    light: "/logos/dark.svg",
    dark: "/logos/light.svg",
  },
  favicon: "/logos/favicon.png",
  colors: {
    primary: "#009ee1",
    light: "#66c4ed",
    dark: "#009ee1",
  },
  theme: "quill",

  topbarCtaButton: {
    name: "Start building now",
    url: "https://console.withampersand.com/sign-up",
  },
  topbarLinks: [
    {
      name: "Sign in",
      url: "https://console.withampersand.com/sign-in",
    },
  ],
  anchors: [
    {
      name: "About us",
      icon: "users",
      url: "https://www.withampersand.com/about-us",
    },
    {
      name: "Blog",
      icon: "newspaper",
      url: "https://www.withampersand.com/blog",
    },
  ],
  tabs: [
    {
      name: "API Reference",
      url: "api-reference",
    },
  ],

  navigation: [
    {
      group: "Documentation",
      pages: [
        "overview",
        "quickstart",
        {
          group: "Define integrations",
          pages: [
            "define-integrations/defining-integrations",
            "define-integrations/read-actions",
            "define-integrations/write-actions",
            "define-integrations/proxy-actions",
            "define-integrations/subscribe-actions",
            "define-integrations/destinations",
          ],
        },
        "deploy-integrations",
        "embeddable-ui-components",
        "glossary",
        {
          group: "Provider guides",
          pages: [
            "provider-guides/aha",
            "provider-guides/gong",
            "provider-guides/hubspot",
            "provider-guides/asana",
            "provider-guides/intercom",
            "provider-guides/attio",
            "provider-guides/jira",
            "provider-guides/aweber",
            "provider-guides/notion",
            "provider-guides/box",
            "provider-guides/ outreach",
            "provider-guides/bynder",
            "provider-guides/pinterest",
            "provider-guides/calendly",
            "provider-guides/pipedrive",
            "provider-guides/clickup",
            "provider-guides/provider-guidessalesloft",
            "provider-guides/close-crm",
            "provider-guides/salesforce",
            "provider-guides/copper",
            "provider-guides/smartsheet",
            "provider-guides/discord",
            "provider-guides/survey-monkey",
            "provider-guides/docusign",
            "provider-guides/webflow",
            "provider-guides/drift",
            "provider-guides/zendesk-support",
            "provider-guides/dropbox",
            "provider-guides/zoho-crm",
            "provider-guides/facebook",
            "provider-guides/zoom",
            "provider-guides/figma",
          ],
        },
      ],
    },
    {
      group: "READ API",
      pages: readApiPages,
    },
    {
      group: "WRITE API",
      pages: writeApiPages,
    },
    {
      group: "PLATFORM API",
      pages: platformApiPages,
    },
  ],

  footerSocials: {
    linkedin: "https://www.linkedin.com/company/withampersand",
    twitter: "https://twitter.com/withampersand",
  },
};

interface NavigationGroup {
  group: string;
  pages: Array<string | NavigationGroup>;
}

try {
  const outPath = process.argv[2];
  if (outPath) {
    console.log(
      `[${new Date().toISOString()}] Writing mint config to ${outPath}`
    );

    fs.writeFileSync(outPath, JSON.stringify(mintConfig, null, 2));
  } else {
    console.log(JSON.stringify(mintConfig));
  }
} catch (error) {
  console.log("error generate mintlify config", error);
}
