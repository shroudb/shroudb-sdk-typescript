/**
 * ShroudbPulse client.
 *
 * Auto-generated from shroudb-pulse protocol spec. Do not edit.
 */

import { Connection, DEFAULT_PORT } from "./connection";
import { Pool, type PoolOptions } from "./pool";
import { Pipeline } from "./pipeline";
import { Subscription } from "./subscription";
import { ShroudbPulseError } from "./errors";
import type { ActorsResponse, AuthResponse, CountResponse, ErrorsResponse, HotspotsResponse, IngestResponse, IngestBatchResponse, QueryResponse, SourceListResponse, SourceStatusResponse } from "./types";


/**
 * Parse a ShroudbPulse connection URI.
 *
 * Supported formats:
 * - `shroudb-pulse://localhost`
 * - `shroudb-pulse://localhost:7099`
 * - `shroudb-pulse+tls://prod.example.com`
 * - `shroudb-pulse://mytoken@localhost:7099`
 * - `shroudb-pulse://mytoken@localhost/sessions`
 * - `shroudb-pulse+tls://tok@host:7099/keys`
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
  if (uri.startsWith("shroudb-pulse+tls://")) {
    tls = true;
    rest = uri.slice("shroudb-pulse+tls://".length);
  } else if (uri.startsWith("shroudb-pulse://")) {
    rest = uri.slice("shroudb-pulse://".length);
  } else {
    throw new ShroudbPulseError("BADARG", `Invalid ShroudbPulse URI: ${uri}  (expected shroudb-pulse:// or shroudb-pulse+tls://)`);
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
  let port = 7099;
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
 * Async client for the ShroudbPulse Observability plane for unified audit event streaming.
 *
 * Connect using a ShroudbPulse URI:
 *
 * ```ts
 * const client = await ShroudbPulseClient.connect("shroudb-pulse://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 *
 * // With TLS and auth:
 * const client = await ShroudbPulseClient.connect("shroudb-pulse+tls://mytoken@prod.example.com/keys");
 * ```
 */
export class ShroudbPulseClient {
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
   * Connect to a ShroudbPulse server.
   *
   * @param uri — ShroudbPulse connection URI.
   *   Format: `shroudb-pulse://[token@]host[:port][/keyspace]`
   *   or `shroudb-pulse+tls://[token@]host[:port][/keyspace]`
   * @param poolOptions — Connection pool tuning.
   */
  static async connect(
    uri: string = "shroudb-pulse://localhost",
    poolOptions?: PoolOptions,
  ): Promise<ShroudbPulseClient> {
    const cfg = parseUri(uri);
    const pool = new Pool(cfg.host, cfg.port, cfg.tls, cfg.authToken, poolOptions);
    return new ShroudbPulseClient(pool, cfg.host, cfg.port, cfg.tls, cfg.authToken);
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

  /** Most active actors */
  async actors(options?: { window?: string }): Promise<ActorsResponse> {
    const args: string[] = [];
    args.push("ACTORS");
    if (options?.window !== undefined) args.push("WINDOW", String(options.window));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      actors: m["actors"] as unknown,
    } as ActorsResponse;
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

  /** Count events matching filter arguments */
  async count(): Promise<CountResponse> {
    const args: string[] = [];
    args.push("COUNT");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      count: m["count"] as unknown,
    } as CountResponse;
  }

  /** Per-operation error rates */
  async errors(options?: { engine?: string; window?: string }): Promise<ErrorsResponse> {
    const args: string[] = [];
    args.push("ERRORS");
    if (options?.engine !== undefined) args.push("ENGINE", String(options.engine));
    if (options?.window !== undefined) args.push("WINDOW", String(options.window));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      errorRates: m["error_rates"] as unknown,
    } as ErrorsResponse;
  }

  /** Check server health */
  async health(): Promise<void> {
    const args: string[] = [];
    args.push("HEALTH");
    const result = await this.execute(...args);
  }

  /** Find hotspot resources with highest activity */
  async hotspots(options?: { engine?: string; window?: string }): Promise<HotspotsResponse> {
    const args: string[] = [];
    args.push("HOTSPOTS");
    if (options?.engine !== undefined) args.push("ENGINE", String(options.engine));
    if (options?.window !== undefined) args.push("WINDOW", String(options.window));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      hotspots: m["hotspots"] as unknown,
    } as HotspotsResponse;
  }

  /** Ingest a single audit event */
  async ingest(json: string): Promise<IngestResponse> {
    const args: string[] = [];
    args.push("INGEST");
    args.push(String(json));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      id: m["id"] as unknown,
    } as IngestResponse;
  }

  /** Ingest a batch of audit events */
  async ingestBatch(json: string): Promise<IngestBatchResponse> {
    const args: string[] = [];
    args.push("INGEST_BATCH");
    args.push(String(json));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      count: m["count"] as unknown,
      ids: m["ids"] as unknown,
    } as IngestBatchResponse;
  }

  /** Query events with filter arguments */
  async query(): Promise<QueryResponse> {
    const args: string[] = [];
    args.push("QUERY");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      events: m["events"] as unknown,
    } as QueryResponse;
  }

  /** List configured event sources */
  async sourceList(): Promise<SourceListResponse> {
    const args: string[] = [];
    args.push("SOURCE_LIST");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      sources: m["sources"] as unknown,
    } as SourceListResponse;
  }

  /** Show per-source ingestion statistics */
  async sourceStatus(): Promise<SourceStatusResponse> {
    const args: string[] = [];
    args.push("SOURCE_STATUS");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      sources: m["sources"] as unknown,
    } as SourceStatusResponse;
  }
}
