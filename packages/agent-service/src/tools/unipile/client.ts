let clientInstance: UnipileClient | null = null;

class UnipileClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.accessToken = accessToken;
  }

  async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      "X-API-KEY": this.accessToken,
      Accept: "application/json",
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Unipile API error ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async postForm<T>(path: string, body: Record<string, string>): Promise<T> {
    const headers: Record<string, string> = {
      "X-API-KEY": this.accessToken,
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers,
      body: new URLSearchParams(body).toString(),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Unipile API error ${response.status}: ${text}`);
    }

    return response.json() as Promise<T>;
  }
}

export function getUnipileAccountId(): string {
  const accountId = process.env.UNIPILE_ACCOUNT_ID;
  if (!accountId) throw new Error("UNIPILE_ACCOUNT_ID not set");
  return accountId;
}

export function getUnipileGmailAccountId(): string {
  const accountId = process.env.UNIPILE_GMAIL_ACCOUNT_ID;
  if (!accountId) throw new Error("UNIPILE_GMAIL_ACCOUNT_ID not set");
  return accountId;
}

export function getUnipileClient(): UnipileClient {
  if (!clientInstance) {
    const baseUrl = process.env.UNIPILE_DSN;
    const accessToken = process.env.UNIPILE_ACCESS_TOKEN;
    if (!baseUrl) throw new Error("UNIPILE_DSN not set");
    if (!accessToken) throw new Error("UNIPILE_ACCESS_TOKEN not set");
    clientInstance = new UnipileClient(baseUrl, accessToken);
  }
  return clientInstance;
}
