let clientInstance: ProspeoClient | null = null;

const BASE_URL = "https://api.prospeo.io";

class ProspeoClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      "X-KEY": this.apiKey,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Prospeo API error ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }
}

export function getProspeoClient(): ProspeoClient {
  if (!clientInstance) {
    const apiKey = process.env.PROSPEO_API_KEY;
    if (!apiKey) throw new Error("PROSPEO_API_KEY not set");
    clientInstance = new ProspeoClient(apiKey);
  }
  return clientInstance;
}
