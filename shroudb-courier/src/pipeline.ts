/**
 * ShroudbCourier pipeline for batching commands into a single round-trip.
 *
 * Auto-generated from shroudb-courier protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import type { Pool } from "./pool";
import type { AuthResponse, ChannelInfoResponse, ChannelListResponse, ConnectionsResponse, DeliverResponse, TemplateInfoResponse, TemplateListResponse, TemplateReloadResponse } from "./types";

type Parser<T> = (raw: unknown) => T;

/**
 * Pipeline for batching ShroudbCourier commands into a single round-trip.
 *
 * ```ts
 * const pipe = client.pipeline();
 * pipe.issue("keyspace", { ttlSecs: 3600 });
 * pipe.verify("keyspace", token);
 * const results = await pipe.execute();
 * ```
 */
export class Pipeline {
  private conn: Connection | null = null;
  private commands: Array<{ args: string[]; parser: Parser<unknown> | null }> = [];
  private pool: Pool;

  /** @internal */
  constructor(pool: Pool) {
    this.pool = pool;
  }

  /** Authenticate the connection */
  auth(token: unknown): this {
    const args: string[] = [];
    args.push("AUTH");
    args.push(String(token));
    this.commands.push({ args, parser: (raw) => raw as AuthResponse });
    return this;
  }

  /** Get subscriber count for a WebSocket channel */
  channelInfo(channel: unknown): this {
    const args: string[] = [];
    args.push("CHANNEL_INFO");
    args.push(String(channel));
    this.commands.push({ args, parser: (raw) => raw as ChannelInfoResponse });
    return this;
  }

  /** List all active WebSocket channels */
  channelList(): this {
    const args: string[] = [];
    args.push("CHANNEL_LIST");
    this.commands.push({ args, parser: (raw) => raw as ChannelListResponse });
    return this;
  }

  /** Get total WebSocket connections */
  connections(): this {
    const args: string[] = [];
    args.push("CONNECTIONS");
    this.commands.push({ args, parser: (raw) => raw as ConnectionsResponse });
    return this;
  }

  /** Deliver a notification (decrypts recipient, renders template, sends via adapter) */
  deliver(json: string): this {
    const args: string[] = [];
    args.push("DELIVER");
    args.push(String(json));
    this.commands.push({ args, parser: (raw) => raw as DeliverResponse });
    return this;
  }

  /** Check server health */
  health(): this {
    const args: string[] = [];
    args.push("HEALTH");
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Get information about a specific template */
  templateInfo(name: string): this {
    const args: string[] = [];
    args.push("TEMPLATE_INFO");
    args.push(String(name));
    this.commands.push({ args, parser: (raw) => raw as TemplateInfoResponse });
    return this;
  }

  /** List all loaded templates */
  templateList(): this {
    const args: string[] = [];
    args.push("TEMPLATE_LIST");
    this.commands.push({ args, parser: (raw) => raw as TemplateListResponse });
    return this;
  }

  /** Reload templates from disk */
  templateReload(): this {
    const args: string[] = [];
    args.push("TEMPLATE_RELOAD");
    this.commands.push({ args, parser: (raw) => raw as TemplateReloadResponse });
    return this;
  }

  /** Send all queued commands and return typed responses. */
  async execute(): Promise<unknown[]> {
    const conn = await this.pool.get();
    try {
      for (const { args } of this.commands) {
        conn.sendCommand(...args);
      }
      const results: unknown[] = [];
      for (const { parser } of this.commands) {
        const raw = await conn.readResponse();
        results.push(parser ? parser(raw) : raw);
      }
      this.pool.put(conn);
      this.commands = [];
      return results;
    } catch (e) {
      conn.close();
      throw e;
    }
  }

  /** Number of queued commands. */
  get length(): number { return this.commands.length; }

  /** Discard all queued commands. */
  clear(): void { this.commands = []; }
}
