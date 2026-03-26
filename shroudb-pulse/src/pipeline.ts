/**
 * ShroudbPulse pipeline for batching commands into a single round-trip.
 *
 * Auto-generated from shroudb-pulse protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import type { Pool } from "./pool";
import type { ActorsResponse, AuthResponse, CountResponse, ErrorsResponse, HotspotsResponse, IngestResponse, IngestBatchResponse, QueryResponse, SourceListResponse, SourceStatusResponse } from "./types";

type Parser<T> = (raw: unknown) => T;

/**
 * Pipeline for batching ShroudbPulse commands into a single round-trip.
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

  /** Most active actors */
  actors(options?: { window?: string }): this {
    const args: string[] = [];
    args.push("ACTORS");
    if (options?.window !== undefined) args.push("WINDOW", String(options.window));
    this.commands.push({ args, parser: (raw) => raw as ActorsResponse });
    return this;
  }

  /** Authenticate the connection */
  auth(token: unknown): this {
    const args: string[] = [];
    args.push("AUTH");
    args.push(String(token));
    this.commands.push({ args, parser: (raw) => raw as AuthResponse });
    return this;
  }

  /** Count events matching filter arguments */
  count(): this {
    const args: string[] = [];
    args.push("COUNT");
    this.commands.push({ args, parser: (raw) => raw as CountResponse });
    return this;
  }

  /** Per-operation error rates */
  errors(options?: { engine?: string; window?: string }): this {
    const args: string[] = [];
    args.push("ERRORS");
    if (options?.engine !== undefined) args.push("ENGINE", String(options.engine));
    if (options?.window !== undefined) args.push("WINDOW", String(options.window));
    this.commands.push({ args, parser: (raw) => raw as ErrorsResponse });
    return this;
  }

  /** Check server health */
  health(): this {
    const args: string[] = [];
    args.push("HEALTH");
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Find hotspot resources with highest activity */
  hotspots(options?: { engine?: string; window?: string }): this {
    const args: string[] = [];
    args.push("HOTSPOTS");
    if (options?.engine !== undefined) args.push("ENGINE", String(options.engine));
    if (options?.window !== undefined) args.push("WINDOW", String(options.window));
    this.commands.push({ args, parser: (raw) => raw as HotspotsResponse });
    return this;
  }

  /** Ingest a single audit event */
  ingest(json: string): this {
    const args: string[] = [];
    args.push("INGEST");
    args.push(String(json));
    this.commands.push({ args, parser: (raw) => raw as IngestResponse });
    return this;
  }

  /** Ingest a batch of audit events */
  ingestBatch(json: string): this {
    const args: string[] = [];
    args.push("INGEST_BATCH");
    args.push(String(json));
    this.commands.push({ args, parser: (raw) => raw as IngestBatchResponse });
    return this;
  }

  /** Query events with filter arguments */
  query(): this {
    const args: string[] = [];
    args.push("QUERY");
    this.commands.push({ args, parser: (raw) => raw as QueryResponse });
    return this;
  }

  /** List configured event sources */
  sourceList(): this {
    const args: string[] = [];
    args.push("SOURCE_LIST");
    this.commands.push({ args, parser: (raw) => raw as SourceListResponse });
    return this;
  }

  /** Show per-source ingestion statistics */
  sourceStatus(): this {
    const args: string[] = [];
    args.push("SOURCE_STATUS");
    this.commands.push({ args, parser: (raw) => raw as SourceStatusResponse });
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
