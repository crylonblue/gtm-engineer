let clientInstance: LemlistClient | null = null;

const BASE_URL = "https://api.lemlist.com/api";

class LemlistClient {
  private authHeader: string;

  constructor(apiKey: string) {
    // Lemlist uses HTTP Basic auth with empty username and API key as password
    this.authHeader = `Basic ${btoa(`:${apiKey}`)}`;
  }

  async request<T>(
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
    path: string,
    body?: unknown,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: "application/json",
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Lemlist API error ${response.status}: ${text}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    return response.text() as unknown as T;
  }

  async get<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>("GET", path, undefined, query);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  async delete<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): Promise<T> {
    return this.request<T>("DELETE", path, undefined, query);
  }
}

export function getLemlistClient(): LemlistClient {
  if (!clientInstance) {
    const apiKey = process.env.LEMLIST_API_KEY;
    if (!apiKey) throw new Error("LEMLIST_API_KEY not set");
    clientInstance = new LemlistClient(apiKey);
  }
  return clientInstance;
}
