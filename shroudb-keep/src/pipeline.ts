/**
 * ShroudbKeep pipeline for batching commands into a single round-trip.
 *
 * Auto-generated from shroudb-keep protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import type { Pool } from "./pool";
import type { AuthResponse, DeleteResponse, GetResponse, ListResponse, PutResponse, RotateResponse, VersionsResponse } from "./types";

type Parser<T> = (raw: unknown) => T;

/**
 * Pipeline for batching ShroudbKeep commands into a single round-trip.
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

  /** Soft-delete a secret */
  delete(path: string): this {
    const args: string[] = [];
    args.push("DELETE");
    args.push(String(path));
    this.commands.push({ args, parser: (raw) => raw as DeleteResponse });
    return this;
  }

  /** Retrieve a secret (latest or specific version) */
  get(path: string, options?: { version?: number }): this {
    const args: string[] = [];
    args.push("GET");
    args.push(String(path));
    if (options?.version !== undefined) args.push("VERSION", String(options.version));
    this.commands.push({ args, parser: (raw) => raw as GetResponse });
    return this;
  }

  /** Check server health */
  health(path?: string): this {
    const args: string[] = [];
    args.push("HEALTH");
    if (path !== undefined) args.push(String(path));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** List secret paths matching a prefix */
  list(prefix?: string): this {
    const args: string[] = [];
    args.push("LIST");
    if (prefix !== undefined) args.push(String(prefix));
    this.commands.push({ args, parser: (raw) => raw as ListResponse });
    return this;
  }

  /** Store a secret (creates a new version) */
  put(path: string, value: string, options?: { meta?: string }): this {
    const args: string[] = [];
    args.push("PUT");
    args.push(String(path));
    args.push(String(value));
    if (options?.meta !== undefined) args.push("META", String(options.meta));
    this.commands.push({ args, parser: (raw) => raw as PutResponse });
    return this;
  }

  /** Re-encrypt the latest version under the current key */
  rotate(path: string): this {
    const args: string[] = [];
    args.push("ROTATE");
    args.push(String(path));
    this.commands.push({ args, parser: (raw) => raw as RotateResponse });
    return this;
  }

  /** Show version history for a secret */
  versions(path: string): this {
    const args: string[] = [];
    args.push("VERSIONS");
    args.push(String(path));
    this.commands.push({ args, parser: (raw) => raw as VersionsResponse });
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
