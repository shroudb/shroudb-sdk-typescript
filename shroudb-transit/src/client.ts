/**
 * ShroudbTransit client.
 *
 * Auto-generated from shroudb-transit protocol spec. Do not edit.
 */

import { Connection, DEFAULT_PORT } from "./connection";
import { Pool, type PoolOptions } from "./pool";
import { Pipeline } from "./pipeline";
import { Subscription } from "./subscription";
import { ShroudbTransitError } from "./errors";
import type { DecryptResponse, EncryptResponse, GenerateDataKeyResponse, KeyInfoResponse, RewrapResponse, RotateResponse, SignResponse, VerifySignatureResponse } from "./types";


/**
 * Parse a ShroudbTransit connection URI.
 *
 * Supported formats:
 * - `shroudb-transit://localhost`
 * - `shroudb-transit://localhost:6499`
 * - `shroudb-transit+tls://prod.example.com`
 * - `shroudb-transit://mytoken@localhost:6499`
 * - `shroudb-transit://mytoken@localhost/sessions`
 * - `shroudb-transit+tls://tok@host:6499/keys`
 */
function parseUri(uri: string): {
  host: string;
  port: number;
  tls: boolean;
  authToken?: string;
  keyspace?: string;
} {
  let tls = false;
  let rest: string;
  if (uri.startsWith("shroudb-transit+tls://")) {
    tls = true;
    rest = uri.slice("shroudb-transit+tls://".length);
  } else if (uri.startsWith("shroudb-transit://")) {
    rest = uri.slice("shroudb-transit://".length);
  } else {
    throw new ShroudbTransitError("BADARG", `Invalid ShroudbTransit URI: ${uri}  (expected shroudb-transit:// or shroudb-transit+tls://)`);
  }

  let authToken: string | undefined;
  const atIdx = rest.indexOf("@");
  if (atIdx >= 0) {
    authToken = rest.substring(0, atIdx);
    rest = rest.substring(atIdx + 1);
  }

  let keyspace: string | undefined;
  const slashIdx = rest.indexOf("/");
  if (slashIdx >= 0) {
    const ks = rest.substring(slashIdx + 1);
    keyspace = ks || undefined;
    rest = rest.substring(0, slashIdx);
  }

  let host = rest;
  let port = 6499;
  const colonIdx = host.lastIndexOf(":");
  if (colonIdx >= 0) {
    const parsed = parseInt(host.substring(colonIdx + 1), 10);
    if (!isNaN(parsed)) {
      port = parsed;
      host = host.substring(0, colonIdx);
    }
  }

  return { host, port, tls, authToken, keyspace };
}

/**
 * Async client for the ShroudbTransit Encryption-as-a-service.
 *
 * Connect using a ShroudbTransit URI:
 *
 * ```ts
 * const client = await ShroudbTransitClient.connect("shroudb-transit://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 *
 * // With TLS and auth:
 * const client = await ShroudbTransitClient.connect("shroudb-transit+tls://mytoken@prod.example.com/keys");
 * ```
 */
export class ShroudbTransitClient {
  /** @internal */
  private pool: Pool;
  /** @internal */
  private readonly _host: string;
  /** @internal */
  private readonly _port: number;
  /** @internal */
  private readonly _tls: boolean;
  /** @internal */
  private readonly _auth: string | undefined;

  private constructor(pool: Pool, host: string, port: number, tls: boolean, auth: string | undefined) {
    this.pool = pool;
    this._host = host;
    this._port = port;
    this._tls = tls;
    this._auth = auth;
  }

  /**
   * Connect to a ShroudbTransit server.
   *
   * @param uri — ShroudbTransit connection URI.
   *   Format: `shroudb-transit://[token@]host[:port][/keyspace]`
   *   or `shroudb-transit+tls://[token@]host[:port][/keyspace]`
   * @param poolOptions — Connection pool tuning.
   */
  static async connect(
    uri: string = "shroudb-transit://localhost",
    poolOptions?: PoolOptions,
  ): Promise<ShroudbTransitClient> {
    const cfg = parseUri(uri);
    const pool = new Pool(cfg.host, cfg.port, cfg.tls, cfg.authToken, poolOptions);
    return new ShroudbTransitClient(pool, cfg.host, cfg.port, cfg.tls, cfg.authToken);
  }

  /** Close the client and all pooled connections. */
  close(): void {
    this.pool.close();
  }

  /** @internal */
  private async execute(...args: string[]): Promise<unknown> {
    const conn = await this.pool.get();
    try {
      const result = await conn.execute(...args);
      this.pool.put(conn);
      return result;
    } catch (e) {
      conn.close();
      throw e;
    }
  }

  /** Create a pipeline for batching commands into a single round-trip. */
  pipeline(): Pipeline {
    return new Pipeline(this.pool);
  }

  /** Decrypt ciphertext using the embedded key version */
  async decrypt(keyring: string, ciphertext: string, options?: { context?: unknown }): Promise<DecryptResponse> {
    const args: string[] = [];
    args.push("DECRYPT");
    args.push(String(keyring));
    args.push(String(ciphertext));
    if (options?.context !== undefined) args.push("CONTEXT", String(options.context));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      plaintext: m["plaintext"] as string,
    } as DecryptResponse;
  }

  /** Encrypt plaintext with the active key version */
  async encrypt(keyring: string, plaintext: string, options?: { context?: unknown; keyVersion?: number; convergent?: unknown }): Promise<EncryptResponse> {
    const args: string[] = [];
    args.push("ENCRYPT");
    args.push(String(keyring));
    args.push(String(plaintext));
    if (options?.context !== undefined) args.push("CONTEXT", String(options.context));
    if (options?.keyVersion !== undefined) args.push("KEY_VERSION", String(options.keyVersion));
    if (options?.convergent !== undefined) args.push("CONVERGENT", String(options.convergent));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      ciphertext: m["ciphertext"] as string,
      keyVersion: m["key_version"] != null ? Number(m["key_version"]) : undefined,
    } as EncryptResponse;
  }

  /** Generate a data encryption key (envelope encryption pattern) */
  async generateDataKey(keyring: string, options?: { bits?: number }): Promise<GenerateDataKeyResponse> {
    const args: string[] = [];
    args.push("GENERATE_DATA_KEY");
    args.push(String(keyring));
    if (options?.bits !== undefined) args.push("BITS", String(options.bits));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      plaintextKey: m["plaintext_key"] as string,
      wrappedKey: m["wrapped_key"] as string,
      keyVersion: m["key_version"] != null ? Number(m["key_version"]) : undefined,
    } as GenerateDataKeyResponse;
  }

  /** Check server health */
  async health(keyring?: string): Promise<void> {
    const args: string[] = [];
    args.push("HEALTH");
    if (keyring !== undefined) args.push(String(keyring));
    const result = await this.execute(...args);
  }

  /** Get keyring metadata and key version information */
  async keyInfo(keyring: string): Promise<KeyInfoResponse> {
    const args: string[] = [];
    args.push("KEY_INFO");
    args.push(String(keyring));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      keyring: m["keyring"] as string,
      type: m["type"] as unknown,
      activeVersion: m["active_version"] != null ? Number(m["active_version"]) : undefined,
      versions: m["versions"] as unknown,
    } as KeyInfoResponse;
  }

  /** Re-encrypt ciphertext with the current active key version */
  async rewrap(keyring: string, ciphertext: string, options?: { context?: unknown }): Promise<RewrapResponse> {
    const args: string[] = [];
    args.push("REWRAP");
    args.push(String(keyring));
    args.push(String(ciphertext));
    if (options?.context !== undefined) args.push("CONTEXT", String(options.context));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      ciphertext: m["ciphertext"] as string,
      keyVersion: m["key_version"] != null ? Number(m["key_version"]) : undefined,
    } as RewrapResponse;
  }

  /** Rotate the keyring to a new key version */
  async rotate(keyring: string, options?: { force?: unknown; dryrun?: unknown }): Promise<RotateResponse> {
    const args: string[] = [];
    args.push("ROTATE");
    args.push(String(keyring));
    if (options?.force !== undefined) args.push("FORCE", String(options.force));
    if (options?.dryrun !== undefined) args.push("DRYRUN", String(options.dryrun));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      keyVersion: m["key_version"] != null ? Number(m["key_version"]) : undefined,
      previousVersion: m["previous_version"] != null ? Number(m["previous_version"]) : undefined,
    } as RotateResponse;
  }

  /** Create a detached signature */
  async sign(keyring: string, data: string, options?: { algorithm?: unknown }): Promise<SignResponse> {
    const args: string[] = [];
    args.push("SIGN");
    args.push(String(keyring));
    args.push(String(data));
    if (options?.algorithm !== undefined) args.push("ALGORITHM", String(options.algorithm));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      signature: m["signature"] as string,
      keyVersion: m["key_version"] != null ? Number(m["key_version"]) : undefined,
    } as SignResponse;
  }

  /** Verify a detached signature */
  async verifySignature(keyring: string, data: string, signature: string): Promise<VerifySignatureResponse> {
    const args: string[] = [];
    args.push("VERIFY_SIGNATURE");
    args.push(String(keyring));
    args.push(String(data));
    args.push(String(signature));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      valid: m["valid"] as unknown,
    } as VerifySignatureResponse;
  }
}
