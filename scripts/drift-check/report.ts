import { promises as fs } from 'node:fs';
import path from 'node:path';

export type Severity = 'error' | 'warning' | 'info';

export interface Finding {
  provider: string;          // exact catalog key, case preserved
  module?: string | 'all';   // required for multi-module providers when known
  severity: Severity;
  kind: string;
  docPath?: string;
  docClaim?: string;
  catalogTruth?: unknown;
  suggestedFix?: string;
}

export interface Report {
  catalogSource: string;
  checkedAt: string;          // ISO timestamp
  mode: 'per-pr' | 'full' | 'provider';
  findings: Finding[];
}

export async function writeReport(report: Report, outDir: string): Promise<void> {
  await fs.mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'drift-report.json');
  const mdPath = path.join(outDir, 'drift-report.md');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2) + '\n');
  await fs.writeFile(mdPath, toMarkdown(report));
  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
}

function toMarkdown(report: Report): string {
  const bySeverity: Record<Severity, Finding[]> = { error: [], warning: [], info: [] };
  for (const f of report.findings) bySeverity[f.severity].push(f);

  const lines: string[] = [];
  lines.push('# Drift check report');
  lines.push('');
  lines.push(`- Catalog source: \`${report.catalogSource}\``);
  lines.push(`- Checked at: \`${report.checkedAt}\``);
  lines.push(`- Mode: \`${report.mode}\``);
  lines.push(`- Totals: ${bySeverity.error.length} error, ${bySeverity.warning.length} warning, ${bySeverity.info.length} info`);
  lines.push('');

  for (const sev of ['error', 'warning', 'info'] as const) {
    const group = bySeverity[sev];
    if (group.length === 0) continue;
    lines.push(`## ${capitalize(sev)} (${group.length})`);
    lines.push('');
    for (const f of group.sort(sortByProvider)) {
      const mod = f.module ? ` [${f.module}]` : '';
      lines.push(`### ${f.provider}${mod} — ${f.kind}`);
      if (f.docPath) lines.push(`- File: \`${f.docPath}\``);
      if (f.docClaim) lines.push(`- Doc says: ${f.docClaim}`);
      if (f.catalogTruth !== undefined) lines.push(`- Catalog says: \`${JSON.stringify(f.catalogTruth)}\``);
      if (f.suggestedFix) lines.push(`- Fix: ${f.suggestedFix}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

function sortByProvider(a: Finding, b: Finding): number {
  if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
  return (a.kind ?? '').localeCompare(b.kind ?? '');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
