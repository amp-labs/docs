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

export async function checkSampleLink(blobUrl: string): Promise<SampleCheckResult> {
  const rawUrl = toRawUrl(blobUrl);
  try {
    const res = await fetch(rawUrl, { method: 'HEAD' });
    return { url: blobUrl, exists: res.ok, status: res.status };
  } catch {
    return { url: blobUrl, exists: false };
  }
}
