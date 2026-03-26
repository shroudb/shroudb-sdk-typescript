/** Minimal HTTP transport for the ShrouDB SDK. */
export class HttpTransport {
  constructor(
    private baseUrl: string,
    private token?: string,
  ) {}

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const resp = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`ShrouDB ${method} ${path}: ${resp.status} ${text}`);
    }
    return resp.json() as T;
  }

  async get<T>(path: string): Promise<T> {
    return this.request('GET', path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request('POST', path, body);
  }

  async delete<T>(path: string): Promise<T> {
    return this.request('DELETE', path);
  }
}
