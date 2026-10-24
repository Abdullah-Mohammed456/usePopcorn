export type OmdbFailureCode =
  | "OMDB_NOT_CONFIGURED"
  | "OMDB_INVALID_KEY_FORMAT"
  | "OMDB_AUTHENTICATION_FAILED"
  | "OMDB_QUOTA_EXCEEDED"
  | "OMDB_TIMEOUT"
  | "OMDB_CONNECTION_FAILED"
  | "OMDB_HTTP_ERROR"
  | "OMDB_INVALID_RESPONSE";

export class OmdbProviderError extends Error {
  constructor(
    readonly code: OmdbFailureCode,
    readonly upstreamStatus?: number,
  ) {
    super(code);
    this.name = "OmdbProviderError";
  }
}

export async function fetchFromOmdb(
  params: Record<string, string>,
): Promise<unknown> {
  const apiKey = process.env.OMDB_API_KEY?.trim();
  if (!apiKey) throw new OmdbProviderError("OMDB_NOT_CONFIGURED");
  if (/^https?:\/\//i.test(apiKey) || /[?&]apikey=/i.test(apiKey)) {
    throw new OmdbProviderError("OMDB_INVALID_KEY_FORMAT");
  }

  const url = new URL("https://www.omdbapi.com/");
  for (const [key, value] of Object.entries({ ...params, apikey: apiKey })) {
    url.searchParams.set(key, value);
  }

  const signal = AbortSignal.timeout(8_000);
  let upstream: globalThis.Response;
  try {
    upstream = await fetch(url, { signal });
  } catch (error) {
    // Never retain or log the original fetch error: it can include the secret URL.
    const timedOut =
      signal.aborted ||
      (error instanceof Error && error.name === "TimeoutError");
    throw new OmdbProviderError(
      timedOut ? "OMDB_TIMEOUT" : "OMDB_CONNECTION_FAILED",
    );
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    if (signal.aborted) throw new OmdbProviderError("OMDB_TIMEOUT");
    // Preserve authentication/quota HTTP status even for a non-JSON error body.
    if (upstream.status === 401 || upstream.status === 403) {
      throw new OmdbProviderError(
        "OMDB_AUTHENTICATION_FAILED",
        upstream.status,
      );
    }
    if (upstream.status === 429) {
      throw new OmdbProviderError("OMDB_QUOTA_EXCEEDED", upstream.status);
    }
    throw new OmdbProviderError(
      upstream.ok ? "OMDB_INVALID_RESPONSE" : "OMDB_HTTP_ERROR",
      upstream.status,
    );
  }

  const providerMessage =
    typeof payload === "object" &&
    payload !== null &&
    "Error" in payload &&
    typeof payload.Error === "string"
      ? payload.Error.toLowerCase()
      : "";

  if (
    upstream.status === 429 ||
    /request limit|quota|too many requests/.test(providerMessage)
  ) {
    throw new OmdbProviderError("OMDB_QUOTA_EXCEEDED", upstream.status);
  }
  if (
    upstream.status === 401 ||
    upstream.status === 403 ||
    /api key|apikey|activation|not activated/.test(providerMessage)
  ) {
    throw new OmdbProviderError("OMDB_AUTHENTICATION_FAILED", upstream.status);
  }
  if (!upstream.ok) {
    throw new OmdbProviderError("OMDB_HTTP_ERROR", upstream.status);
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("Response" in payload) ||
    (payload.Response !== "True" && payload.Response !== "False")
  ) {
    throw new OmdbProviderError("OMDB_INVALID_RESPONSE", upstream.status);
  }

  return payload;
}
