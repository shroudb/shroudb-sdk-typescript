import { HttpTransport } from './transport';

export class KeepNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** AUTH — Authenticate the connection */
  async auth(token: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${token}`, );
  }

  /** DELETE — Soft-delete a secret */
  async delete(path: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${path}`, { verb: 'DELETE' });
  }

  /** GET — Retrieve a secret (latest or specific version) */
  async get(path: string, options?: {
    version?: number;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${path}`, );
  }

  /** HEALTH — Check server health */
  async health(path: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${path}`, );
  }

  /** LIST — List secret paths matching a prefix */
  async list(prefix: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${prefix}`, );
  }

  /** PUT — Store a secret (creates a new version) */
  async put(path: string, value: string, options?: {
    meta?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${path}`, { verb: 'PUT', ...options });
  }

  /** ROTATE — Re-encrypt the latest version under the current key */
  async rotate(path: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${path}`, { verb: 'ROTATE' });
  }

  /** VERSIONS — Show version history for a secret */
  async versions(path: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${path}`, );
  }

}
