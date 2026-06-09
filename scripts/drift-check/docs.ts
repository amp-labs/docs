import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const PROVIDER_GUIDES_DIR = path.join(process.cwd(), 'src', 'provider-guides');

// Files in src/provider-guides/ that are not provider guides.
const NON_GUIDE_FILES = new Set(['overview.mdx', 'AGENTS.md', 'CLAUDE.md']);

export type Capability = 'read' | 'write' | 'proxy' | 'subscribe' | 'search';

export interface GuideDoc {
  docPath: string;
  slug: string;
  providerKeyFromFrontmatter?: string;
  guideType?: string;
  claimedActions: Set<Capability>;
  sampleLinks: string[];
}

const ACTION_PATTERNS: Array<{ cap: Capability; re: RegExp }> = [
  { cap: 'read', re: /\[Read Actions\]\(\/read-actions\)/ },
  { cap: 'write', re: /\[Write Actions\]\(\/write-actions\)/ },
  { cap: 'subscribe', re: /\[Subscribe Actions\]\(\/subscribe-actions\)/ },
  { cap: 'proxy', re: /\[Proxy Actions\]\(\/proxy-actions\)/ },
  { cap: 'search', re: /\[Search Actions\]\(\/search-actions\)/ },
];

const SAMPLE_LINK_RE =
  /https:\/\/github\.com\/amp-labs\/samples\/blob\/[^/]+\/[^/]+\/amp\.ya?ml/g;

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
    const claimedActions = new Set<Capability>();
    for (const { cap, re } of ACTION_PATTERNS) {
      if (re.test(parsed.content)) claimedActions.add(cap);
    }
    const sampleLinks = Array.from(
      new Set(parsed.content.match(SAMPLE_LINK_RE) ?? []),
    );
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
