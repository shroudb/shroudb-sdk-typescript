/**
 * ShroudbCourier client.
 *
 * Auto-generated from shroudb-courier protocol spec. Do not edit.
 */

import { Connection, DEFAULT_PORT } from "./connection";
import { Pool, type PoolOptions } from "./pool";
import { Pipeline } from "./pipeline";
import { Subscription } from "./subscription";
import { ShroudbCourierError } from "./errors";
import type { AuthResponse, ChannelInfoResponse, ChannelListResponse, ConnectionsResponse, DeliverResponse, TemplateInfoResponse, TemplateListResponse, TemplateReloadResponse } from "./types";


/**
 * Parse a ShroudbCourier connection URI.
 *
 * Supported formats:
 * - `shroudb-courier://localhost`
 * - `shroudb-courier://localhost:6999`
 * - `shroudb-courier+tls://prod.example.com`
 * - `shroudb-courier://mytoken@localhost:6999`
 * - `shroudb-courier://mytoken@localhost/sessions`
 * - `shroudb-courier+tls://tok@host:6999/keys`
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
  if (uri.startsWith("shroudb-courier+tls://")) {
    tls = true;
    rest = uri.slice("shroudb-courier+tls://".length);
  } else if (uri.startsWith("shroudb-courier://")) {
    rest = uri.slice("shroudb-courier://".length);
  } else {
    throw new ShroudbCourierError("BADARG", `Invalid ShroudbCourier URI: ${uri}  (expected shroudb-courier:// or shroudb-courier+tls://)`);
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
  let port = 6999;
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
 * Async client for the ShroudbCourier Secure notification delivery pipeline.
 *
 * Connect using a ShroudbCourier URI:
 *
 * ```ts
 * const client = await ShroudbCourierClient.connect("shroudb-courier://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 *
 * // With TLS and auth:
 * const client = await ShroudbCourierClient.connect("shroudb-courier+tls://mytoken@prod.example.com/keys");
 * ```
 */
export class ShroudbCourierClient {
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
   * Connect to a ShroudbCourier server.
   *
   * @param uri — ShroudbCourier connection URI.
   *   Format: `shroudb-courier://[token@]host[:port][/keyspace]`
   *   or `shroudb-courier+tls://[token@]host[:port][/keyspace]`
   * @param poolOptions — Connection pool tuning.
   */
  static async connect(
    uri: string = "shroudb-courier://localhost",
    poolOptions?: PoolOptions,
  ): Promise<ShroudbCourierClient> {
    const cfg = parseUri(uri);
    const pool = new Pool(cfg.host, cfg.port, cfg.tls, cfg.authToken, poolOptions);
    return new ShroudbCourierClient(pool, cfg.host, cfg.port, cfg.tls, cfg.authToken);
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

  /** Get subscriber count for a WebSocket channel */
  async channelInfo(channel: unknown): Promise<ChannelInfoResponse> {
    const args: string[] = [];
    args.push("CHANNEL_INFO");
    args.push(String(channel));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      channel: m["channel"] as unknown,
      subscribers: m["subscribers"] as unknown,
    } as ChannelInfoResponse;
  }

  /** List all active WebSocket channels */
  async channelList(): Promise<ChannelListResponse> {
    const args: string[] = [];
    args.push("CHANNEL_LIST");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      channels: m["channels"] as unknown,
    } as ChannelListResponse;
  }

  /** Get total WebSocket connections */
  async connections(): Promise<ConnectionsResponse> {
    const args: string[] = [];
    args.push("CONNECTIONS");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      connections: m["connections"] as unknown,
    } as ConnectionsResponse;
  }

  /** Deliver a notification (decrypts recipient, renders template, sends via adapter) */
  async deliver(json: string): Promise<DeliverResponse> {
    const args: string[] = [];
    args.push("DELIVER");
    args.push(String(json));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      deliveryId: m["delivery_id"] as string,
      channel: m["channel"] as string,
      status: m["status"] as unknown,
    } as DeliverResponse;
  }

  /** Check server health */
  async health(): Promise<void> {
    const args: string[] = [];
    args.push("HEALTH");
    const result = await this.execute(...args);
  }

  /** Get information about a specific template */
  async templateInfo(name: string): Promise<TemplateInfoResponse> {
    const args: string[] = [];
    args.push("TEMPLATE_INFO");
    args.push(String(name));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      name: m["name"] as string,
      channels: m["channels"] as unknown,
      variables: m["variables"] as unknown,
      loadedAt: m["loaded_at"] as unknown,
    } as TemplateInfoResponse;
  }

  /** List all loaded templates */
  async templateList(): Promise<TemplateListResponse> {
    const args: string[] = [];
    args.push("TEMPLATE_LIST");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      templates: m["templates"] as unknown,
    } as TemplateListResponse;
  }

  /** Reload templates from disk */
  async templateReload(): Promise<TemplateReloadResponse> {
    const args: string[] = [];
    args.push("TEMPLATE_RELOAD");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      count: m["count"] as unknown,
    } as TemplateReloadResponse;
  }
}
