/**
 * ShroudbKeep client.
 *
 * Auto-generated from shroudb-keep protocol spec. Do not edit.
 */

import { Connection, DEFAULT_PORT } from "./connection";
import { Pool, type PoolOptions } from "./pool";
import { Pipeline } from "./pipeline";
import { Subscription } from "./subscription";
import { ShroudbKeepError } from "./errors";
import type { AuthResponse, DeleteResponse, GetResponse, ListResponse, PutResponse, RotateResponse, VersionsResponse } from "./types";


/**
 * Parse a ShroudbKeep connection URI.
 *
 * Supported formats:
 * - `shroudb-keep://localhost`
 * - `shroudb-keep://localhost:6899`
 * - `shroudb-keep+tls://prod.example.com`
 * - `shroudb-keep://mytoken@localhost:6899`
 * - `shroudb-keep://mytoken@localhost/sessions`
 * - `shroudb-keep+tls://tok@host:6899/keys`
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
  if (uri.startsWith("shroudb-keep+tls://")) {
    tls = true;
    rest = uri.slice("shroudb-keep+tls://".length);
  } else if (uri.startsWith("shroudb-keep://")) {
    rest = uri.slice("shroudb-keep://".length);
  } else {
    throw new ShroudbKeepError("BADARG", `Invalid ShroudbKeep URI: ${uri}  (expected shroudb-keep:// or shroudb-keep+tls://)`);
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
  let port = 6899;
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
 * Async client for the ShroudbKeep Secrets manager.
 *
 * Connect using a ShroudbKeep URI:
 *
 * ```ts
 * const client = await ShroudbKeepClient.connect("shroudb-keep://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 *
 * // With TLS and auth:
 * const client = await ShroudbKeepClient.connect("shroudb-keep+tls://mytoken@prod.example.com/keys");
 * ```
 */
export class ShroudbKeepClient {
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
   * Connect to a ShroudbKeep server.
   *
   * @param uri — ShroudbKeep connection URI.
   *   Format: `shroudb-keep://[token@]host[:port][/keyspace]`
   *   or `shroudb-keep+tls://[token@]host[:port][/keyspace]`
   * @param poolOptions — Connection pool tuning.
   */
  static async connect(
    uri: string = "shroudb-keep://localhost",
    poolOptions?: PoolOptions,
  ): Promise<ShroudbKeepClient> {
    const cfg = parseUri(uri);
    const pool = new Pool(cfg.host, cfg.port, cfg.tls, cfg.authToken, poolOptions);
    return new ShroudbKeepClient(pool, cfg.host, cfg.port, cfg.tls, cfg.authToken);
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

  /** Soft-delete a secret */
  async delete(path: string): Promise<DeleteResponse> {
    const args: string[] = [];
    args.push("DELETE");
    args.push(String(path));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      path: m["path"] as string,
      deletedAt: m["deleted_at"] as unknown,
    } as DeleteResponse;
  }

  /** Retrieve a secret (latest or specific version) */
  async get(path: string, options?: { version?: number }): Promise<GetResponse> {
    const args: string[] = [];
    args.push("GET");
    args.push(String(path));
    if (options?.version !== undefined) args.push("VERSION", String(options.version));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      path: m["path"] as string,
      value: m["value"] as string,
      version: m["version"] != null ? Number(m["version"]) : undefined,
      meta: m["meta"] as string,
      createdAt: m["created_at"] as unknown,
    } as GetResponse;
  }

  /** Check server health */
  async health(path?: string): Promise<void> {
    const args: string[] = [];
    args.push("HEALTH");
    if (path !== undefined) args.push(String(path));
    const result = await this.execute(...args);
  }

  /** List secret paths matching a prefix */
  async list(prefix?: string): Promise<ListResponse> {
    const args: string[] = [];
    args.push("LIST");
    if (prefix !== undefined) args.push(String(prefix));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      paths: m["paths"] as unknown,
    } as ListResponse;
  }

  /** Store a secret (creates a new version) */
  async put(path: string, value: string, options?: { meta?: string }): Promise<PutResponse> {
    const args: string[] = [];
    args.push("PUT");
    args.push(String(path));
    args.push(String(value));
    if (options?.meta !== undefined) args.push("META", String(options.meta));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      path: m["path"] as string,
      version: m["version"] != null ? Number(m["version"]) : undefined,
    } as PutResponse;
  }

  /** Re-encrypt the latest version under the current key */
  async rotate(path: string): Promise<RotateResponse> {
    const args: string[] = [];
    args.push("ROTATE");
    args.push(String(path));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      path: m["path"] as string,
      version: m["version"] != null ? Number(m["version"]) : undefined,
    } as RotateResponse;
  }

  /** Show version history for a secret */
  async versions(path: string): Promise<VersionsResponse> {
    const args: string[] = [];
    args.push("VERSIONS");
    args.push(String(path));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      path: m["path"] as string,
      versions: m["versions"] as unknown,
    } as VersionsResponse;
  }
}
