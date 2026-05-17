// Sparse overrides and allowances. Only encode exceptions here; convention covers the rest.

export interface UndocumentedAllowance {
  provider: string;
  reason: string;
  until: string;   // ISO date; allowance expires after this
}

export interface Recipes {
  slugOverrides: Record<string, string>;
  undocumentedAllowed: UndocumentedAllowance[];
}

export const recipes: Recipes = {
  slugOverrides: {
    // instantly.mdx documents the V2 catalog entry (instantlyAI); the V1 entry
    // is allowed undocumented below.
    instantly: 'instantlyAI',
    'google-workspace-delegation': 'googleWorkspaceDelegation',
    'netsuite-m2m': 'netsuiteM2M',
    'salesforce-jwt': 'salesforceJWT',
    // jira.mdx is an alias guide pointing readers to the Atlassian guide.
    jira: 'atlassian',
    // highlevel.mdx covers the Standard variant; the WhiteLabel variant is
    // allowed undocumented below.
    highlevel: 'highLevelStandard',
  },

  undocumentedAllowed: [
    {
      provider: 'instantly',
      reason: 'Legacy V1 connector; current public guide covers instantlyAI.',
      until: '2026-09-01',
    },
    { provider: 'adyenTest', reason: 'Internal test variant.', until: '2027-01-01' },
    { provider: 'gladlyQA', reason: 'QA-only variant.', until: '2027-01-01' },
    { provider: 'deelSandbox', reason: 'Sandbox variant.', until: '2027-01-01' },
    { provider: 'gustoDemo', reason: 'Demo variant.', until: '2027-01-01' },
    { provider: 'paddleSandbox', reason: 'Sandbox variant.', until: '2027-01-01' },
    { provider: 'payPalSandBox', reason: 'Sandbox variant.', until: '2027-01-01' },
    { provider: 'procoreSandbox', reason: 'Sandbox variant.', until: '2027-01-01' },
    { provider: 'quickbooksSandbox', reason: 'Sandbox variant.', until: '2027-01-01' },
    { provider: 'rampDemo', reason: 'Demo variant.', until: '2027-01-01' },
    { provider: 'ironcladDemo', reason: 'Demo variant.', until: '2027-01-01' },
    { provider: 'leverSandbox', reason: 'Sandbox variant.', until: '2027-01-01' },
    {
      provider: 'highLevelWhiteLabel',
      reason: 'WhiteLabel variant; highlevel.mdx covers the Standard variant.',
      until: '2026-09-01',
    },
  ],
};
