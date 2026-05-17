#!/usr/bin/env tsx
import { parseArgs } from 'node:util';
import path from 'node:path';
import {
  fetchCatalog,
  hasModules,
  supports,
  modulesSupporting,
  type Capability,
  type CatalogProvider,
} from './catalog';
import { scanGuides, resolveProviderKey } from './docs';
import { checkSampleLink } from './samples';
import { recipes } from './recipes';
import { writeReport, type Finding, type Report } from './report';

async function main() {
  // Accept both `drift-check --out X` and `pnpm run drift-check -- --out X`.
  const args = process.argv.slice(2);
  if (args[0] === '--') args.shift();
  const { values } = parseArgs({
    args,
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

  // The undocumented-provider check requires a global view, so it only runs in full mode.
  if (mode === 'full') {
    const documentedKeys = new Set(
      guides.map((g) => resolveProviderKey(g, recipes.slugOverrides, catalogKeys)),
    );
    const today = new Date();
    for (const catalogKey of catalogKeys) {
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

  const sampleChecks: Promise<void>[] = [];
  for (const guide of guides) {
    const providerKey = resolveProviderKey(guide, recipes.slugOverrides, catalogKeys);
    const provider = catalog.data[providerKey];
    if (!provider) {
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
      if (!supports(provider, cap as Capability)) {
        findings.push(
          withModule(provider, {
            provider: providerKey,
            severity: 'error',
            kind: `doc-overclaims-${cap}`,
            docPath: guide.docPath,
            docClaim: `Guide includes "[${capitalize(cap)} Actions](/${cap}-actions)".`,
            catalogTruth: {
              providerLevel: providerLevelSupport(provider, cap as Capability),
              modulesSupporting: modulesSupporting(provider, cap as Capability),
            },
            suggestedFix: `Remove the ${cap} action claim, or update the connector if support was added but not flagged.`,
          }),
        );
      }
    }
    for (const sampleLink of guide.sampleLinks) {
      sampleChecks.push(
        checkSampleLink(sampleLink).then((r) => {
          if (!r.exists) {
            findings.push(
              withModule(provider, {
                provider: providerKey,
                severity: 'error',
                kind: 'broken-sample-link',
                docPath: guide.docPath,
                docClaim: r.url,
                catalogTruth: { httpStatus: r.status ?? 'fetch failed' },
                suggestedFix: `Update or remove the sample link. The referenced file does not exist at ${r.url}.`,
              }),
            );
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

// Default module to "all" on findings for multi-module providers; v1 does not attribute claims to a specific module.
function withModule(provider: CatalogProvider, finding: Finding): Finding {
  if (finding.module !== undefined) return finding;
  if (hasModules(provider)) return { ...finding, module: 'all' };
  return finding;
}

function providerLevelSupport(provider: CatalogProvider, cap: Capability): unknown {
  if (cap === 'search') return provider.support?.search ?? false;
  return provider.support?.[cap] ?? false;
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
