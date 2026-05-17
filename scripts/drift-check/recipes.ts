// Sparse overrides and allowances for the drift check.
// Only encode exceptions here. Every other case should be conventional.

export interface UndocumentedAllowance {
  provider: string;     // exact catalog key
  reason: string;
  until: string;        // ISO date; allowance expires after this
}

export interface Recipes {
  // Maps a doc file slug (filename without .mdx) to the catalog provider key
  // when they differ. Use only when the conventional `<provider>.mdx` lookup
  // does not apply.
  slugOverrides: Record<string, string>;

  // Catalog provider keys that are intentionally undocumented. Anything not
  // listed here that lacks a guide will produce an `undocumented-provider`
  // error finding.
  undocumentedAllowed: UndocumentedAllowance[];
}

export const recipes: Recipes = {
  slugOverrides: {
    // The instantly.mdx guide currently documents the instantlyAI catalog
    // entry (V2 API). The instantly catalog entry (Legacy V1) is allowed
    // undocumented below.
    instantly: 'instantlyAI',
    // Filename uses hyphens; catalog keys are camelCase without hyphens.
    'google-workspace-delegation': 'googleWorkspaceDelegation',
    'netsuite-m2m': 'netsuiteM2M',
    'salesforce-jwt': 'salesforceJWT',
    // jira.mdx is an alias guide that points readers to the Atlassian guide.
    // Mapping it to atlassian lets it inherit the same catalog-side checks.
    jira: 'atlassian',
    // highlevel.mdx documents the Standard variant; the WhiteLabel variant
    // is intentionally undocumented (see undocumentedAllowed below).
    highlevel: 'highLevelStandard',
  },

  undocumentedAllowed: [
    {
      provider: 'instantly',
      reason: 'Legacy V1 connector; current public guide covers instantlyAI.',
      until: '2026-09-01',
    },
    {
      provider: 'adyenTest',
      reason: 'Internal test variant; not user-facing.',
      until: '2027-01-01',
    },
    {
      provider: 'gladlyQA',
      reason: 'QA-only variant of gladly; not user-facing.',
      until: '2027-01-01',
    },
    {
      provider: 'deelSandbox',
      reason: 'Sandbox variant; share docs with deel.',
      until: '2027-01-01',
    },
    {
      provider: 'gustoDemo',
      reason: 'Demo variant; share docs with gusto.',
      until: '2027-01-01',
    },
    {
      provider: 'paddleSandbox',
      reason: 'Sandbox variant.',
      until: '2027-01-01',
    },
    {
      provider: 'paypalSandbox',
      reason: 'Sandbox variant.',
      until: '2027-01-01',
    },
    {
      provider: 'procoreSandbox',
      reason: 'Sandbox variant.',
      until: '2027-01-01',
    },
    {
      provider: 'quickbooksSandbox',
      reason: 'Sandbox variant.',
      until: '2027-01-01',
    },
    {
      provider: 'rampDemo',
      reason: 'Demo variant.',
      until: '2027-01-01',
    },
    {
      provider: 'ironcladDemo',
      reason: 'Demo variant.',
      until: '2027-01-01',
    },
    {
      provider: 'leverSandbox',
      reason: 'Sandbox variant.',
      until: '2027-01-01',
    },
    {
      provider: 'highLevelWhiteLabel',
      reason: 'WhiteLabel variant; the highlevel.mdx guide covers the Standard variant.',
      until: '2026-09-01',
    },
  ],
};
