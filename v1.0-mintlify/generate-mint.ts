import apiPages from "./api-reference/index.json";
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
    name: "Start Building Now",
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
        "supported-apis",
        "glossary",
      ],
    },
    {
      group: "AMPERSAND PUBLIC API",
      pages: apiPages,
    },
    // {
    //   group: "AMPERSAND PUBLIC WRITE API",
    //   pages: [
    //     {
    //       group: "Write",
    //       pages: ["api-reference/write/create-update-upsert-or-delete-records"],
    //     },
    //     {
    //       group: "Upload URL",
    //       pages: [
    //         "api-reference/upload-url-1/generate-a-signed-url-to-upload-write-data-to",
    //       ],
    //     },
    //   ],
    // },
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
