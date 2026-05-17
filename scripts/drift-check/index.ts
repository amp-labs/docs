#!/usr/bin/env tsx
/**
 * Drift check v1.
 *
 * Static comparison of provider guides against the connectors catalog.
 * Three checks:
 *   - undocumented-provider: catalog has a provider with no guide and no
 *     allowance in recipes.ts
 *   - doc-overclaims-<capability>: guide claims an action the catalog
 *     (module-aware) does not support
 *   - broken-sample-link: guide links to a sample manifest that 404s
 *
 * Modes:
 *   --mode full          scan every provider guide (default)
 *   --mode per-pr        scan only .mdx files passed via --changed
 *   --mode provider      scan a single provider via --provider <key>
 *
 * Output:
 *   --out <dir>          write drift-report.json and drift-report.md
 *                        (default ./drift-report)
 */
import { parseArgs } from 'node:util';
import path from 'node:path';
import {
  fetchCatalog,
  supports,
  modulesSupporting,
  type Capability,
} from './catalog';
import { scanGuides, resolveProviderKey, type GuideDoc } from './docs';
import { checkSampleLink } from './samples';
import { recipes } from './recipes';
import { writeReport, type Finding, type Report } from './report';

async function main() {
  const { values } = parseArgs({
    options: {
      mode: { type: 'string', default: 'full' },
      provider: { type: 'string' },
      changed: { type: 'string', multiple: true },
      out: { type: 'string', default: './drift-report' },
      'fail-on-error': { type: 'boolean', default: false },
    },
  });

  const mode = values.mode as 'full' | 'per-pr' | 'provider';

  const catalog = await fetchCatalog();
  const catalogKeys = Object.keys(catalog.data);
  let guides = await scanGuides();

  if (mode === 'per-pr') {
    const changedSet = new Set((values.changed ?? []).map((p) => path.normalize(p)));
    guides = guides.filter((g) => changedSet.has(path.normalize(g.docPath)));
  } else if (mode === 'provider') {
    if (!values.provider) {
      throw new Error('--provider <key> required with --mode provider');
    }
    guides = guides.filter(
      (g) =>
        resolveProviderKey(g, recipes.slugOverrides, catalogKeys) === values.provider,
    );
  }

  const findings: Finding[] = [];

  // Check: undocumented providers. Full mode only; otherwise the per-PR slice
  // can't tell what's missing.
  if (mode === 'full') {
    const documentedKeys = new Set(
      (await scanGuides()).map((g) => resolveProviderKey(g, recipes.slugOverrides, catalogKeys)),
    );
    const today = new Date();
    for (const catalogKey of Object.keys(catalog.data)) {
      if (documentedKeys.has(catalogKey)) continue;
      const allow = recipes.undocumentedAllowed.find((a) => a.provider === catalogKey);
      if (allow) {
        if (new Date(allow.until) < today) {
          findings.push({
            provider: catalogKey,
            severity: 'warning',
            kind: 'undocumented-provider-allowance-expired',
            suggestedFix: `Renew or remove the allowance for "${catalogKey}" in scripts/drift-check/recipes.ts (current until=${allow.until}).`,
          });
        }
        continue;
      }
      findings.push({
        provider: catalogKey,
        severity: 'error',
        kind: 'undocumented-provider',
        suggestedFix: `Add a provider guide at src/provider-guides/${catalogKey}.mdx, or add "${catalogKey}" to undocumentedAllowed in scripts/drift-check/recipes.ts with a reason and an "until" date.`,
      });
    }
  }

  // Check: doc-overclaims-<capability> + collect sample-link checks.
  const sampleChecks: Promise<void>[] = [];
  for (const guide of guides) {
    const providerKey = resolveProviderKey(guide, recipes.slugOverrides, catalogKeys);
    const cp = catalog.data[providerKey];
    if (!cp) {
      findings.push({
        provider: providerKey,
        severity: 'error',
        kind: 'guide-without-catalog-entry',
        docPath: guide.docPath,
        suggestedFix: `The guide resolves to provider key "${providerKey}" but the catalog has no such entry. Check the frontmatter "provider" field or add a slugOverride in recipes.ts.`,
      });
      continue;
    }
    for (const cap of guide.claimedActions) {
      if (!supports(cp, cap as Capability)) {
        findings.push({
          provider: providerKey,
          severity: 'error',
          kind: `doc-overclaims-${cap}`,
          docPath: guide.docPath,
          docClaim: `Guide includes "[${capitalize(cap)} Actions](/${cap}-actions)".`,
          catalogTruth: {
            providerLevel: cp.support?.[cap as Capability] ?? false,
            modulesSupporting: modulesSupporting(cp, cap as Capability),
          },
          suggestedFix: `Remove the ${cap} action claim, or update the connector if support was added but not flagged.`,
        });
      }
    }
    if (guide.sampleLink) {
      sampleChecks.push(
        checkSampleLink(guide.sampleLink).then((r) => {
          if (!r.exists) {
            findings.push({
              provider: providerKey,
              severity: 'error',
              kind: 'broken-sample-link',
              docPath: guide.docPath,
              docClaim: r.url,
              catalogTruth: { httpStatus: r.status ?? 'fetch failed' },
              suggestedFix: `Update or remove the sample link. The referenced file does not exist at ${r.url}.`,
            });
          }
        }),
      );
    }
  }
  await Promise.all(sampleChecks);

  const report: Report = {
    catalogSource: `${catalog.sourceUrl} (fetched from amp-labs/connectors@main)`,
    checkedAt: catalog.fetchedAt,
    mode,
    findings,
  };
  await writeReport(report, values.out!);

  const errorCount = findings.filter((f) => f.severity === 'error').length;
  console.log(
    `\n${findings.length} findings (${errorCount} error, ${
      findings.filter((f) => f.severity === 'warning').length
    } warning, ${findings.filter((f) => f.severity === 'info').length} info).`,
  );
  if (values['fail-on-error'] && errorCount > 0) {
    process.exit(1);
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
