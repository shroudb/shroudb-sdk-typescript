/**
 * ShroudbSentry client.
 *
 * Auto-generated from shroudb-sentry protocol spec. Do not edit.
 */

import { Connection, DEFAULT_PORT } from "./connection";
import { Pool, type PoolOptions } from "./pool";
import { Pipeline } from "./pipeline";
import { Subscription } from "./subscription";
import { ShroudbSentryError } from "./errors";
import type { AuthResponse, EvaluateResponse, KeyInfoResponse, KeyRotateResponse, PolicyInfoResponse, PolicyListResponse, PolicyReloadResponse } from "./types";


/**
 * Parse a ShroudbSentry connection URI.
 *
 * Supported formats:
 * - `shroudb-sentry://localhost`
 * - `shroudb-sentry://localhost:6799`
 * - `shroudb-sentry+tls://prod.example.com`
 * - `shroudb-sentry://mytoken@localhost:6799`
 * - `shroudb-sentry://mytoken@localhost/sessions`
 * - `shroudb-sentry+tls://tok@host:6799/keys`
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
  if (uri.startsWith("shroudb-sentry+tls://")) {
    tls = true;
    rest = uri.slice("shroudb-sentry+tls://".length);
  } else if (uri.startsWith("shroudb-sentry://")) {
    rest = uri.slice("shroudb-sentry://".length);
  } else {
    throw new ShroudbSentryError("BADARG", `Invalid ShroudbSentry URI: ${uri}  (expected shroudb-sentry:// or shroudb-sentry+tls://)`);
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
  let port = 6799;
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
 * Async client for the ShroudbSentry Policy-based authorization engine.
 *
 * Connect using a ShroudbSentry URI:
 *
 * ```ts
 * const client = await ShroudbSentryClient.connect("shroudb-sentry://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 *
 * // With TLS and auth:
 * const client = await ShroudbSentryClient.connect("shroudb-sentry+tls://mytoken@prod.example.com/keys");
 * ```
 */
export class ShroudbSentryClient {
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
   * Connect to a ShroudbSentry server.
   *
   * @param uri — ShroudbSentry connection URI.
   *   Format: `shroudb-sentry://[token@]host[:port][/keyspace]`
   *   or `shroudb-sentry+tls://[token@]host[:port][/keyspace]`
   * @param poolOptions — Connection pool tuning.
   */
  static async connect(
    uri: string = "shroudb-sentry://localhost",
    poolOptions?: PoolOptions,
  ): Promise<ShroudbSentryClient> {
    const cfg = parseUri(uri);
    const pool = new Pool(cfg.host, cfg.port, cfg.tls, cfg.authToken, poolOptions);
    return new ShroudbSentryClient(pool, cfg.host, cfg.port, cfg.tls, cfg.authToken);
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

  /** Authenticate the connection */
  async auth(token: unknown): Promise<AuthResponse> {
    const args: string[] = [];
    args.push("AUTH");
    args.push(String(token));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      status: m["status"] as unknown,
    } as AuthResponse;
  }

  /** Evaluate an authorization request against loaded policies */
  async evaluate(json: string): Promise<EvaluateResponse> {
    const args: string[] = [];
    args.push("EVALUATE");
    args.push(String(json));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      decision: m["decision"] as string,
      token: m["token"] as string,
      reasons: m["reasons"] as unknown,
    } as EvaluateResponse;
  }

  /** Check server health */
  async health(): Promise<void> {
    const args: string[] = [];
    args.push("HEALTH");
    const result = await this.execute(...args);
  }

  /** Get signing key information */
  async keyInfo(): Promise<KeyInfoResponse> {
    const args: string[] = [];
    args.push("KEY_INFO");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      keyId: m["key_id"] as unknown,
      algorithm: m["algorithm"] as unknown,
      createdAt: m["created_at"] as unknown,
    } as KeyInfoResponse;
  }

  /** Rotate the signing key used for JWT decisions */
  async keyRotate(options?: { force?: unknown; dryrun?: unknown }): Promise<KeyRotateResponse> {
    const args: string[] = [];
    args.push("KEY_ROTATE");
    if (options?.force !== undefined) args.push("FORCE", String(options.force));
    if (options?.dryrun !== undefined) args.push("DRYRUN", String(options.dryrun));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      keyId: m["key_id"] as unknown,
      previousKeyId: m["previous_key_id"] as unknown,
    } as KeyRotateResponse;
  }

  /** Get information about a specific policy */
  async policyInfo(name: string): Promise<PolicyInfoResponse> {
    const args: string[] = [];
    args.push("POLICY_INFO");
    args.push(String(name));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      name: m["name"] as string,
      version: m["version"] as unknown,
      rules: m["rules"] as unknown,
      loadedAt: m["loaded_at"] as unknown,
    } as PolicyInfoResponse;
  }

  /** List all loaded policies */
  async policyList(): Promise<PolicyListResponse> {
    const args: string[] = [];
    args.push("POLICY_LIST");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      policies: m["policies"] as unknown,
    } as PolicyListResponse;
  }

  /** Reload policies from disk */
  async policyReload(): Promise<PolicyReloadResponse> {
    const args: string[] = [];
    args.push("POLICY_RELOAD");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      count: m["count"] as unknown,
    } as PolicyReloadResponse;
  }
}
