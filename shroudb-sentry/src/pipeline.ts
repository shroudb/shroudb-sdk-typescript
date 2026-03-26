/**
 * ShroudbSentry pipeline for batching commands into a single round-trip.
 *
 * Auto-generated from shroudb-sentry protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import type { Pool } from "./pool";
import type { AuthResponse, EvaluateResponse, KeyInfoResponse, KeyRotateResponse, PolicyInfoResponse, PolicyListResponse, PolicyReloadResponse } from "./types";

type Parser<T> = (raw: unknown) => T;

/**
 * Pipeline for batching ShroudbSentry commands into a single round-trip.
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

  /** Evaluate an authorization request against loaded policies */
  evaluate(json: string): this {
    const args: string[] = [];
    args.push("EVALUATE");
    args.push(String(json));
    this.commands.push({ args, parser: (raw) => raw as EvaluateResponse });
    return this;
  }

  /** Check server health */
  health(): this {
    const args: string[] = [];
    args.push("HEALTH");
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Get signing key information */
  keyInfo(): this {
    const args: string[] = [];
    args.push("KEY_INFO");
    this.commands.push({ args, parser: (raw) => raw as KeyInfoResponse });
    return this;
  }

  /** Rotate the signing key used for JWT decisions */
  keyRotate(options?: { force?: unknown; dryrun?: unknown }): this {
    const args: string[] = [];
    args.push("KEY_ROTATE");
    if (options?.force !== undefined) args.push("FORCE", String(options.force));
    if (options?.dryrun !== undefined) args.push("DRYRUN", String(options.dryrun));
    this.commands.push({ args, parser: (raw) => raw as KeyRotateResponse });
    return this;
  }

  /** Get information about a specific policy */
  policyInfo(name: string): this {
    const args: string[] = [];
    args.push("POLICY_INFO");
    args.push(String(name));
    this.commands.push({ args, parser: (raw) => raw as PolicyInfoResponse });
    return this;
  }

  /** List all loaded policies */
  policyList(): this {
    const args: string[] = [];
    args.push("POLICY_LIST");
    this.commands.push({ args, parser: (raw) => raw as PolicyListResponse });
    return this;
  }

  /** Reload policies from disk */
  policyReload(): this {
    const args: string[] = [];
    args.push("POLICY_RELOAD");
    this.commands.push({ args, parser: (raw) => raw as PolicyReloadResponse });
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
