// blob URLs return a 200 HTML page for missing files; raw URLs return 404.
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

// Trusts 404 immediately; retries once on transient errors (5xx, network blips).
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
