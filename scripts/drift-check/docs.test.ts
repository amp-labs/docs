import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseGuideContent } from './docs';

const claims = (content: string) => [...parseGuideContent(content).claimedActions].sort();

test('reads claims whatever the link text', () => {
  const content = `### Supported actions

- [Read Action](/read-actions), including full historic backfill.
- [Write Actions](/write-actions).
- [Proxy Calls](/proxy-actions), using the base URL \`https://api.example.com\`.
`;
  assert.deepEqual(claims(content), ['proxy', 'read', 'write']);
});

test('reads links with an anchor', () => {
  const content = `### Supported Actions

- [Search](/search-actions#search-with-a-raw-filter).
`;
  assert.deepEqual(claims(content), ['search']);
});

test('ignores action links outside the Supported actions section', () => {
  const content = `### Supported actions

- [Proxy Actions](/proxy-actions).

### Supported objects

See [Subscribe Actions](/subscribe-actions) for setup.
`;
  assert.deepEqual(claims(content), ['proxy']);
});

test('finds no claims without a Supported actions section', () => {
  assert.deepEqual(claims('Start making [Proxy Calls](/proxy-actions).'), []);
});

test('finds sample links at any depth', () => {
  const content = `
- [CRM](https://github.com/amp-labs/samples/blob/main/zoho/crm/amp.yaml)
- [Top level](https://github.com/amp-labs/samples/blob/main/hubspot/amp.yaml)
- [Encoded name](https://github.com/amp-labs/samples/blob/main/dynamicsCRM/%20amp.yaml)
- [Repo root](https://github.com/amp-labs/samples)
`;
  assert.deepEqual(parseGuideContent(content).sampleLinks, [
    'https://github.com/amp-labs/samples/blob/main/zoho/crm/amp.yaml',
    'https://github.com/amp-labs/samples/blob/main/hubspot/amp.yaml',
    'https://github.com/amp-labs/samples/blob/main/dynamicsCRM/%20amp.yaml',
  ]);
});
