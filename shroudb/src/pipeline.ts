/**
 * Shroudb pipeline for batching commands into a single round-trip.
 *
 * Auto-generated from shroudb protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import type { Pool } from "./pool";
import type { ConfigGetResponse, HealthResponse, InspectResponse, IssueResponse, JwksResponse, KeysResponse, KeystateResponse, PasswordChangeResponse, PasswordImportResponse, PasswordSetResponse, PasswordVerifyResponse, RefreshResponse, RevokeResponse, RevokeBulkResponse, RevokeFamilyResponse, RotateResponse, SchemaResponse, VerifyResponse } from "./types";

type Parser<T> = (raw: unknown) => T;

/**
 * Pipeline for batching Shroudb commands into a single round-trip.
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

  /** Authenticate the current connection */
  auth(token: string): this {
    const args: string[] = [];
    args.push("AUTH");
    args.push(String(token));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Retrieve a runtime configuration value */
  configGet(key: string): this {
    const args: string[] = [];
    args.push("CONFIG", "GET");
    args.push(String(key));
    this.commands.push({ args, parser: (raw) => raw as ConfigGetResponse });
    return this;
  }

  /** Set a runtime configuration value */
  configSet(key: string, value: string): this {
    const args: string[] = [];
    args.push("CONFIG", "SET");
    args.push(String(key));
    args.push(String(value));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Check server or keyspace health */
  health(keyspace?: string): this {
    const args: string[] = [];
    args.push("HEALTH");
    if (keyspace !== undefined) args.push(String(keyspace));
    this.commands.push({ args, parser: (raw) => raw as HealthResponse });
    return this;
  }

  /** Retrieve full details about a credential */
  inspect(keyspace: string, credentialId: string): this {
    const args: string[] = [];
    args.push("INSPECT");
    args.push(String(keyspace));
    args.push(String(credentialId));
    this.commands.push({ args, parser: (raw) => raw as InspectResponse });
    return this;
  }

  /** Issue a new credential in the given keyspace */
  issue(keyspace: string, options?: { claims?: Record<string, unknown>; metadata?: Record<string, unknown>; ttlSecs?: number; idempotencyKey?: string }): this {
    const args: string[] = [];
    args.push("ISSUE");
    args.push(String(keyspace));
    if (options?.claims !== undefined) args.push("CLAIMS", JSON.stringify(options.claims));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    if (options?.ttlSecs !== undefined) args.push("TTL", String(options.ttlSecs));
    if (options?.idempotencyKey !== undefined) args.push("IDEMPOTENCY_KEY", String(options.idempotencyKey));
    this.commands.push({ args, parser: (raw) => raw as IssueResponse });
    return this;
  }

  /** Return the JSON Web Key Set for a JWT keyspace */
  jwks(keyspace: string): this {
    const args: string[] = [];
    args.push("JWKS");
    args.push(String(keyspace));
    this.commands.push({ args, parser: (raw) => raw as JwksResponse });
    return this;
  }

  /** List credential IDs with optional filtering and pagination */
  keys(keyspace: string, options?: { cursor?: string; pattern?: string; stateFilter?: string; count?: number }): this {
    const args: string[] = [];
    args.push("KEYS");
    args.push(String(keyspace));
    if (options?.cursor !== undefined) args.push("CURSOR", String(options.cursor));
    if (options?.pattern !== undefined) args.push("MATCH", String(options.pattern));
    if (options?.stateFilter !== undefined) args.push("STATE", String(options.stateFilter));
    if (options?.count !== undefined) args.push("COUNT", String(options.count));
    this.commands.push({ args, parser: (raw) => raw as KeysResponse });
    return this;
  }

  /** Show the current key ring state for a keyspace */
  keystate(keyspace: string): this {
    const args: string[] = [];
    args.push("KEYSTATE");
    args.push(String(keyspace));
    this.commands.push({ args, parser: (raw) => raw as KeystateResponse });
    return this;
  }

  /** Change a user's password (requires old password) */
  passwordChange(keyspace: string, userId: string, oldPassword: string, newPassword: string): this {
    const args: string[] = [];
    args.push("PASSWORD", "CHANGE");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(oldPassword));
    args.push(String(newPassword));
    this.commands.push({ args, parser: (raw) => raw as PasswordChangeResponse });
    return this;
  }

  /** Import a pre-hashed password for migration from another system (argon2, bcrypt, scrypt) */
  passwordImport(keyspace: string, userId: string, hash: string, options?: { metadata?: Record<string, unknown> }): this {
    const args: string[] = [];
    args.push("PASSWORD", "IMPORT");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(hash));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    this.commands.push({ args, parser: (raw) => raw as PasswordImportResponse });
    return this;
  }

  /** Set a password for a user in a password keyspace */
  passwordSet(keyspace: string, userId: string, password: string, options?: { metadata?: Record<string, unknown> }): this {
    const args: string[] = [];
    args.push("PASSWORD", "SET");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(password));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    this.commands.push({ args, parser: (raw) => raw as PasswordSetResponse });
    return this;
  }

  /** Verify a user's password */
  passwordVerify(keyspace: string, userId: string, password: string): this {
    const args: string[] = [];
    args.push("PASSWORD", "VERIFY");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(password));
    this.commands.push({ args, parser: (raw) => raw as PasswordVerifyResponse });
    return this;
  }

  /** Exchange a refresh token for a new one */
  refresh(keyspace: string, token: string): this {
    const args: string[] = [];
    args.push("REFRESH");
    args.push(String(keyspace));
    args.push(String(token));
    this.commands.push({ args, parser: (raw) => raw as RefreshResponse });
    return this;
  }

  /** Revoke a credential by ID */
  revoke(keyspace: string, credentialId: string): this {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(keyspace));
    args.push(String(credentialId));
    this.commands.push({ args, parser: (raw) => raw as RevokeResponse });
    return this;
  }

  /** Bulk-revoke multiple credentials */
  revokeBulk(keyspace: string, options?: { ids?: string[] }): this {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(keyspace));
    if (options?.ids) { args.push("BULK"); args.push(...options.ids); }
    this.commands.push({ args, parser: (raw) => raw as RevokeBulkResponse });
    return this;
  }

  /** Revoke all credentials in a refresh token family */
  revokeFamily(keyspace: string, options?: { familyId?: string }): this {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(keyspace));
    if (options?.familyId !== undefined) args.push("FAMILY", String(options.familyId));
    this.commands.push({ args, parser: (raw) => raw as RevokeFamilyResponse });
    return this;
  }

  /** Trigger signing key rotation for a keyspace */
  rotate(keyspace: string, options?: { force?: boolean; nowait?: boolean; dryrun?: boolean }): this {
    const args: string[] = [];
    args.push("ROTATE");
    args.push(String(keyspace));
    if (options?.force) args.push("FORCE");
    if (options?.nowait) args.push("NOWAIT");
    if (options?.dryrun) args.push("DRYRUN");
    this.commands.push({ args, parser: (raw) => raw as RotateResponse });
    return this;
  }

  /** Display the metadata schema for a keyspace */
  schema(keyspace: string): this {
    const args: string[] = [];
    args.push("SCHEMA");
    args.push(String(keyspace));
    this.commands.push({ args, parser: (raw) => raw as SchemaResponse });
    return this;
  }

  // subscribe() requires streaming support — not available in pipeline

  /** Temporarily suspend a credential */
  suspend(keyspace: string, credentialId: string): this {
    const args: string[] = [];
    args.push("SUSPEND");
    args.push(String(keyspace));
    args.push(String(credentialId));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Reactivate a previously suspended credential */
  unsuspend(keyspace: string, credentialId: string): this {
    const args: string[] = [];
    args.push("UNSUSPEND");
    args.push(String(keyspace));
    args.push(String(credentialId));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Update metadata on an existing credential */
  update(keyspace: string, credentialId: string, options?: { metadata?: Record<string, unknown> }): this {
    const args: string[] = [];
    args.push("UPDATE");
    args.push(String(keyspace));
    args.push(String(credentialId));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Verify a credential (JWT, API key, or HMAC signature) */
  verify(keyspace: string, token: string, options?: { payload?: string; checkRevoked?: boolean }): this {
    const args: string[] = [];
    args.push("VERIFY");
    args.push(String(keyspace));
    args.push(String(token));
    if (options?.payload !== undefined) args.push("PAYLOAD", String(options.payload));
    if (options?.checkRevoked) args.push("CHECKREV");
    this.commands.push({ args, parser: (raw) => raw as VerifyResponse });
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
