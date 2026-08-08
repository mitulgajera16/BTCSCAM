/**
 * Outbound HTTP for the ingestion pipeline.
 *
 * Every external fetch sends this User-Agent — SEC and FTC return 403
 * without one. Do not remove it from any request.
 */
export const INGEST_USER_AGENT = "BTCSCAM/1.0 (contact@btcscam.com)";

const DEFAULT_TIMEOUT_MS = 20_000;

async function fetchRaw(url: string, timeoutMs: number): Promise<Response> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": INGEST_USER_AGENT,
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, */*",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`GET ${url} responded ${res.status}`);
  }
  return res;
}

export async function fetchText(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<string> {
  const res = await fetchRaw(url, timeoutMs);
  return res.text();
}

export async function fetchJson<T>(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const res = await fetchRaw(url, timeoutMs);
  return (await res.json()) as T;
}
