const EXA_BASE_URL = "https://api.exa.ai";

let clientInstance: ExaClient | null = null;

class ExaClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async request<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${EXA_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Exa API error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }
}

export function getExaClient(): ExaClient {
  if (!clientInstance) {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) throw new Error("EXA_API_KEY not set");
    clientInstance = new ExaClient(apiKey);
  }
  return clientInstance;
}
