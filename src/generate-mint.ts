import platformApiPages from "./reference/platform.json";
import readApiPages from "./reference/read.json";
import writeApiPages from "./reference/write.json";
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
    }
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
        "embeddable-ui-components",
        {
          group: "CLI",
          pages: [
            "cli/overview"
          ]
        },
        "destinations",
        "terminology",
        {
          group: "Provider guides",
          pages: [
            "provider-guides/overview",
            "provider-guides/aWeber",
            "provider-guides/acuityScheduling",
            "provider-guides/aha",
            "provider-guides/aircall",
            "provider-guides/anthropic",
            "provider-guides/apollo",
            "provider-guides/asana",
            "provider-guides/atlassian",
            "provider-guides/attio",
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
            "provider-guides/linkedIn",
            "provider-guides/mailgun",
            "provider-guides/marketo",
            "provider-guides/microsoft",
            "provider-guides/miro",
            "provider-guides/mixmax",
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
            "provider-guides/rebilly",
            "provider-guides/recurly",
            "provider-guides/salesforce",
            "provider-guides/salesloft",
            "provider-guides/seismic",
            "provider-guides/sendGrid",
            "provider-guides/serviceNow",
            "provider-guides/slack",
            "provider-guides/smartlead",
            "provider-guides/smartsheet",
            "provider-guides/snapchatAds",
            "provider-guides/surveyMonkey",
            "provider-guides/teamleader",
            "provider-guides/teamwork",
            "provider-guides/webflow",
            "provider-guides/wordpress",
            "provider-guides/wrike",
            "provider-guides/zendeskSupport",
            "provider-guides/zoho",
            "provider-guides/zoom"
          ],
        },
        "dev-and-prod-environments",
      ],
    },
    // {
    //   group: "READ API",
    //   pages: readApiPages,
    // },
    {
      group: "Authentication",
      pages: [
        "reference/auth",
      ],
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

  feedback: {
    thumbsRating: true,
    suggestEdit: true,
    raiseIssue: true,
  }
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
