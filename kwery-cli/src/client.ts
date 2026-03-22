const BASE_URL = process.env.KWERY_BASE_URL ?? "https://kwery-api.com";

export class KweryClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    const key = apiKey ?? process.env.KWERY_API_KEY;
    if (!key) throw new Error(
      "KWERY_API_KEY is required. Set it as an environment variable.\n" +
      "Get a key at https://kwery.xyz"
    );
    this.apiKey = key;
  }

  async get<T = unknown>(
    path: string,
    params: Record<string, string | number | boolean | undefined> = {}
  ): Promise<T> {
    const url = new URL(path, BASE_URL);

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) {
        url.searchParams.set(k, String(v));
      }
    });

    const res = await fetch(url.toString(), {
      headers: {
        "X-API-Key": this.apiKey,
        "User-Agent": "kwery-cli/0.1.0",
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = (body as any)?.detail || (body as any)?.message || res.statusText;

      if (res.status === 403) {
        throw new Error(
          `Plan upgrade required: ${message}. Upgrade at https://kwery.xyz/pricing`
        );
      }
      if (res.status === 429) {
        throw new Error("Rate limit exceeded. Slow down requests or upgrade your plan.");
      }
      if (res.status === 401) {
        throw new Error("Invalid or missing API key. Check your KWERY_API_KEY.");
      }
      throw new Error(`Kwery API error ${res.status}: ${message}`);
    }

    return res.json() as T;
  }
}
