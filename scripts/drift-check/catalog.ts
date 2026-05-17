const CATALOG_URL =
  'https://raw.githubusercontent.com/amp-labs/connectors/main/internal/generated/catalog.json';

export type Capability = 'read' | 'write' | 'proxy' | 'subscribe';

interface SupportFlags {
  read?: boolean;
  write?: boolean;
  proxy?: boolean;
  subscribe?: boolean;
}

interface ModuleEntry {
  baseURL?: string;
  displayName?: string;
  support?: SupportFlags;
}

export interface CatalogProvider {
  name?: string;
  displayName?: string;
  authType?: string;
  baseURL?: string;
  defaultModule?: string;
  support?: SupportFlags;
  modules?: Record<string, ModuleEntry>;
}

export interface Catalog {
  data: Record<string, CatalogProvider>;
  sourceUrl: string;
  fetchedAt: string;
}

export async function fetchCatalog(): Promise<Catalog> {
  const res = await fetch(CATALOG_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { catalog: Record<string, CatalogProvider> };
  return {
    data: json.catalog,
    sourceUrl: CATALOG_URL,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Module-aware capability check.
 *
 * Returns true if either the provider-level flag is true, or any module-level
 * flag is true. This is permissive: a guide that claims support without
 * specifying a module is considered correct as long as some part of the
 * provider supports it. Tightening to require module-specific claims is a
 * PR 3 concern.
 */
export function supports(
  provider: CatalogProvider | undefined,
  capability: Capability,
): boolean {
  if (!provider) return false;
  if (provider.support?.[capability]) return true;
  for (const mod of Object.values(provider.modules ?? {})) {
    if (mod.support?.[capability]) return true;
  }
  return false;
}

/** True if the provider has any module entries. */
export function hasModules(provider: CatalogProvider | undefined): boolean {
  return !!provider?.modules && Object.keys(provider.modules).length > 0;
}

/** Lists modules that support the given capability. Useful for advisory output. */
export function modulesSupporting(
  provider: CatalogProvider | undefined,
  capability: Capability,
): string[] {
  if (!provider?.modules) return [];
  return Object.entries(provider.modules)
    .filter(([, mod]) => mod.support?.[capability])
    .map(([name]) => name);
}
