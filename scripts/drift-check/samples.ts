/**
 * Resolve a github.com/...blob/... URL to its raw equivalent, since blob URLs
 * return a 200 HTML page even for missing files. The raw URL returns 404 on
 * missing files, which is what we want for existence checking.
 */
function toRawUrl(blobUrl: string): string {
  return blobUrl
    .replace('github.com/', 'raw.githubusercontent.com/')
    .replace('/blob/', '/');
}

export interface SampleCheckResult {
  url: string;
  exists: boolean;
  status?: number;
}

/**
 * Trusts a 404 immediately (definitive missing). Retries once on network
 * errors or non-404 non-2xx responses, since GitHub raw can produce
 * transient 5xx / connection blips that would otherwise become false
 * positives in CI.
 */
export async function checkSampleLink(blobUrl: string): Promise<SampleCheckResult> {
  const rawUrl = toRawUrl(blobUrl);
  const MAX_ATTEMPTS = 2;
  let lastStatus: number | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(rawUrl, { method: 'HEAD' });
      if (res.ok) return { url: blobUrl, exists: true, status: res.status };
      if (res.status === 404) return { url: blobUrl, exists: false, status: 404 };
      lastStatus = res.status;
    } catch {
      // network error; retry
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  return { url: blobUrl, exists: false, status: lastStatus };
}
