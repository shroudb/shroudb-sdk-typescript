import { HttpTransport } from './transport';

export class VeilNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** AUTH — Authenticate the connection */
  async auth(token: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${token}`, );
  }

  /** CONFIG — Read a runtime configuration value */
  async configGet(key: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${key}`, );
  }

  /** CONFIG — List all configuration keys and values */
  async configList(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/CONFIG`);
  }

  /** CONFIG — Set a runtime configuration value (in-memory only) */
  async configSet(key: string, value: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${key}`, { verb: 'CONFIG', ...options });
  }

  /** CONTAINS — Substring search (case-insensitive) */
  async contains(keyring: string, options?: {
    query?: string;
    field?: string;
    context?: string;
    limit?: number;
    rewrap?: string;
    ciphertexts?: string;
    entries?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

  /** EXACT — Exact equality match (case-insensitive) */
  async exact(keyring: string, options?: {
    query?: string;
    field?: string;
    context?: string;
    limit?: number;
    rewrap?: string;
    ciphertexts?: string;
    entries?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

  /** FUZZY — Fuzzy search using Levenshtein distance (max distance: 2) */
  async fuzzy(keyring: string, options?: {
    query?: string;
    field?: string;
    context?: string;
    limit?: number;
    rewrap?: string;
    ciphertexts?: string;
    entries?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

  /** HEALTH — Check server and Transit backend health */
  async health(): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/HEALTH`);
  }

  /** INDEX — Encrypt plaintext and generate convergent search tokens */
  async index(keyring: string, plaintext: string, options?: {
    field?: string;
    context?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyring}`, { verb: 'INDEX', ...options });
  }

  /** PREFIX — Word-boundary prefix match (case-insensitive) */
  async prefix(keyring: string, options?: {
    query?: string;
    field?: string;
    context?: string;
    limit?: number;
    rewrap?: string;
    ciphertexts?: string;
    entries?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

}
