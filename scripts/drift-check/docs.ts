import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const PROVIDER_GUIDES_DIR = path.join(process.cwd(), 'src', 'provider-guides');

// Files in src/provider-guides/ that are not provider guides.
const NON_GUIDE_FILES = new Set(['overview.mdx']);

export type Capability = 'read' | 'write' | 'proxy' | 'subscribe' | 'search';

export interface GuideDoc {
  docPath: string;
  slug: string;
  providerKeyFromFrontmatter?: string;
  guideType?: string;
  claimedActions: Set<Capability>;
  sampleLinks: string[];
}

// A claim is any link to an action page inside the "Supported actions" section,
// whatever the link text ("Read Action", "Proxy Calls", ...).
const ACTION_LINK_RE = /\]\(\/(read|write|subscribe|proxy|search)-actions[)#]/g;

const SAMPLE_LINK_RE =
  /https:\/\/github\.com\/amp-labs\/samples\/blob\/[^\s)"'>]*amp\.ya?ml/g;

export function parseGuideContent(content: string): {
  claimedActions: Set<Capability>;
  sampleLinks: string[];
} {
  const claimedActions = new Set<Capability>();
  for (const match of supportedActionsSection(content).matchAll(ACTION_LINK_RE)) {
    claimedActions.add(match[1] as Capability);
  }
  const sampleLinks = Array.from(new Set(content.match(SAMPLE_LINK_RE) ?? []));
  return { claimedActions, sampleLinks };
}

// Lines after the "Supported actions" heading, up to the next heading.
function supportedActionsSection(content: string): string {
  const lines = content.split('\n');
  const start = lines.findIndex((l) => /^#+\s+supported actions\s*$/i.test(l));
  if (start === -1) return '';
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^#/.test(l));
  return (end === -1 ? rest : rest.slice(0, end)).join('\n');
}

export async function scanGuides(): Promise<GuideDoc[]> {
  const entries = await fs.readdir(PROVIDER_GUIDES_DIR);
  const guides: GuideDoc[] = [];
  for (const entry of entries) {
    if (!entry.endsWith('.mdx')) continue;
    if (NON_GUIDE_FILES.has(entry)) continue;
    const full = path.join(PROVIDER_GUIDES_DIR, entry);
    const raw = await fs.readFile(full, 'utf8');
    const parsed = matter(raw);
    const slug = entry.replace(/\.mdx$/, '');
    const { claimedActions, sampleLinks } = parseGuideContent(parsed.content);
    guides.push({
      docPath: path.relative(process.cwd(), full),
      slug,
      providerKeyFromFrontmatter:
        typeof parsed.data.provider === 'string' ? parsed.data.provider : undefined,
      guideType:
        typeof parsed.data.guide_type === 'string' ? parsed.data.guide_type : undefined,
      claimedActions,
      sampleLinks,
    });
  }
  return guides;
}

// Resolution priority: frontmatter `provider` > slugOverrides > case-insensitive
// match against catalog keys > filename slug verbatim.
export function resolveProviderKey(
  guide: GuideDoc,
  slugOverrides: Record<string, string>,
  catalogKeys?: readonly string[],
): string {
  if (guide.providerKeyFromFrontmatter) return guide.providerKeyFromFrontmatter;
  if (slugOverrides[guide.slug]) return slugOverrides[guide.slug];
  if (catalogKeys) {
    const ci = guide.slug.toLowerCase();
    const match = catalogKeys.find((k) => k.toLowerCase() === ci);
    if (match) return match;
  }
  return guide.slug;
}
