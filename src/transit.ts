import { HttpTransport } from './transport';

export class TransitNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** DECRYPT — Decrypt ciphertext using the embedded key version */
  async decrypt(keyring: string, ciphertext: string, options?: {
    context?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

  /** ENCRYPT — Encrypt plaintext with the active key version */
  async encrypt(keyring: string, plaintext: string, options?: {
    context?: string;
    key_version?: number;
    convergent?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyring}`, { verb: 'ENCRYPT', ...options });
  }

  /** GENERATE_DATA_KEY — Generate a data encryption key (envelope encryption pattern) */
  async generateDataKey(keyring: string, options?: {
    bits?: number;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyring}`, { verb: 'GENERATE_DATA_KEY', ...options });
  }

  /** HEALTH — Check server health */
  async health(keyring: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

  /** KEY_INFO — Get keyring metadata and key version information */
  async keyInfo(keyring: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

  /** REWRAP — Re-encrypt ciphertext with the current active key version */
  async rewrap(keyring: string, ciphertext: string, options?: {
    context?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyring}`, { verb: 'REWRAP', ...options });
  }

  /** ROTATE — Rotate the keyring to a new key version */
  async rotate(keyring: string, options?: {
    force?: string;
    dryrun?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyring}`, { verb: 'ROTATE', ...options });
  }

  /** SIGN — Create a detached signature */
  async sign(keyring: string, data: string, options?: {
    algorithm?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyring}`, { verb: 'SIGN', ...options });
  }

  /** VERIFY_SIGNATURE — Verify a detached signature */
  async verifySignature(keyring: string, data: string, signature: string): Promise<Record<string, unknown>> {
    return this.transport.get(`${this.prefix}/${keyring}`, );
  }

}
