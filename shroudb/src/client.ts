/**
 * Shroudb client.
 *
 * Auto-generated from shroudb protocol spec. Do not edit.
 */

import { Connection, DEFAULT_PORT } from "./connection";
import { Pool, type PoolOptions } from "./pool";
import { Pipeline } from "./pipeline";
import { Subscription } from "./subscription";
import { ShroudbError } from "./errors";
import type { ConfigGetResponse, HealthResponse, InspectResponse, IssueResponse, JwksResponse, KeysResponse, KeystateResponse, PasswordChangeResponse, PasswordImportResponse, PasswordSetResponse, PasswordVerifyResponse, RefreshResponse, RevokeResponse, RevokeBulkResponse, RevokeFamilyResponse, RotateResponse, SchemaResponse, VerifyResponse } from "./types";


/**
 * Parse a Shroudb connection URI.
 *
 * Supported formats:
 * - `shroudb://localhost`
 * - `shroudb://localhost:6399`
 * - `shroudb+tls://prod.example.com`
 * - `shroudb://mytoken@localhost:6399`
 * - `shroudb://mytoken@localhost/sessions`
 * - `shroudb+tls://tok@host:6399/keys`
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
  if (uri.startsWith("shroudb+tls://")) {
    tls = true;
    rest = uri.slice("shroudb+tls://".length);
  } else if (uri.startsWith("shroudb://")) {
    rest = uri.slice("shroudb://".length);
  } else {
    throw new ShroudbError("BADARG", `Invalid Shroudb URI: ${uri}  (expected shroudb:// or shroudb+tls://)`);
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
  let port = 6399;
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
 * Async client for the Shroudb Credential management server.
 *
 * Connect using a Shroudb URI:
 *
 * ```ts
 * const client = await ShroudbClient.connect("shroudb://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 *
 * // With TLS and auth:
 * const client = await ShroudbClient.connect("shroudb+tls://mytoken@prod.example.com/keys");
 * ```
 */
export class ShroudbClient {
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
   * Connect to a Shroudb server.
   *
   * @param uri — Shroudb connection URI.
   *   Format: `shroudb://[token@]host[:port][/keyspace]`
   *   or `shroudb+tls://[token@]host[:port][/keyspace]`
   * @param poolOptions — Connection pool tuning.
   */
  static async connect(
    uri: string = "shroudb://localhost",
    poolOptions?: PoolOptions,
  ): Promise<ShroudbClient> {
    const cfg = parseUri(uri);
    const pool = new Pool(cfg.host, cfg.port, cfg.tls, cfg.authToken, poolOptions);
    return new ShroudbClient(pool, cfg.host, cfg.port, cfg.tls, cfg.authToken);
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

  /** Authenticate the current connection */
  async auth(token: string): Promise<void> {
    const args: string[] = [];
    args.push("AUTH");
    args.push(String(token));
    const result = await this.execute(...args);
  }

  /** Retrieve a runtime configuration value */
  async configGet(key: string): Promise<ConfigGetResponse> {
    const args: string[] = [];
    args.push("CONFIG", "GET");
    args.push(String(key));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      value: m["value"] as string,
    } as ConfigGetResponse;
  }

  /** Set a runtime configuration value */
  async configSet(key: string, value: string): Promise<void> {
    const args: string[] = [];
    args.push("CONFIG", "SET");
    args.push(String(key));
    args.push(String(value));
    const result = await this.execute(...args);
  }

  /** Check server or keyspace health */
  async health(keyspace?: string): Promise<HealthResponse> {
    const args: string[] = [];
    args.push("HEALTH");
    if (keyspace !== undefined) args.push(String(keyspace));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      state: m["state"] as string,
      keyspaces: typeof m["keyspaces"] === "string" ? JSON.parse(m["keyspaces"] as string) : m["keyspaces"],
      count: m["count"] != null ? Number(m["count"]) : undefined,
    } as HealthResponse;
  }

  /** Retrieve full details about a credential */
  async inspect(keyspace: string, credentialId: string): Promise<InspectResponse> {
    const args: string[] = [];
    args.push("INSPECT");
    args.push(String(keyspace));
    args.push(String(credentialId));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      credentialId: m["credential_id"] as string,
      state: m["state"] as string,
      createdAt: m["created_at"] != null ? Number(m["created_at"]) : undefined,
      expiresAt: m["expires_at"] != null ? Number(m["expires_at"]) : undefined,
      lastVerifiedAt: m["last_verified_at"] != null ? Number(m["last_verified_at"]) : undefined,
      meta: typeof m["meta"] === "string" ? JSON.parse(m["meta"] as string) : m["meta"],
      familyId: m["family_id"] as string,
    } as InspectResponse;
  }

  /** Issue a new credential in the given keyspace */
  async issue(keyspace: string, options?: { claims?: Record<string, unknown>; metadata?: Record<string, unknown>; ttlSecs?: number; idempotencyKey?: string }): Promise<IssueResponse> {
    const args: string[] = [];
    args.push("ISSUE");
    args.push(String(keyspace));
    if (options?.claims !== undefined) args.push("CLAIMS", JSON.stringify(options.claims));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    if (options?.ttlSecs !== undefined) args.push("TTL", String(options.ttlSecs));
    if (options?.idempotencyKey !== undefined) args.push("IDEMPOTENCY_KEY", String(options.idempotencyKey));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      credentialId: m["credential_id"] as string,
      token: m["token"] as string,
      expiresAt: m["expires_at"] != null ? Number(m["expires_at"]) : undefined,
      familyId: m["family_id"] as string,
    } as IssueResponse;
  }

  /** Return the JSON Web Key Set for a JWT keyspace */
  async jwks(keyspace: string): Promise<JwksResponse> {
    const args: string[] = [];
    args.push("JWKS");
    args.push(String(keyspace));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      keys: typeof m["keys"] === "string" ? JSON.parse(m["keys"] as string) : m["keys"],
    } as JwksResponse;
  }

  /** List credential IDs with optional filtering and pagination */
  async keys(keyspace: string, options?: { cursor?: string; pattern?: string; stateFilter?: string; count?: number }): Promise<KeysResponse> {
    const args: string[] = [];
    args.push("KEYS");
    args.push(String(keyspace));
    if (options?.cursor !== undefined) args.push("CURSOR", String(options.cursor));
    if (options?.pattern !== undefined) args.push("MATCH", String(options.pattern));
    if (options?.stateFilter !== undefined) args.push("STATE", String(options.stateFilter));
    if (options?.count !== undefined) args.push("COUNT", String(options.count));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      cursor: m["cursor"] as string,
      keys: typeof m["keys"] === "string" ? JSON.parse(m["keys"] as string) : m["keys"],
    } as KeysResponse;
  }

  /** Show the current key ring state for a keyspace */
  async keystate(keyspace: string): Promise<KeystateResponse> {
    const args: string[] = [];
    args.push("KEYSTATE");
    args.push(String(keyspace));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      keys: typeof m["keys"] === "string" ? JSON.parse(m["keys"] as string) : m["keys"],
    } as KeystateResponse;
  }

  /** Change a user's password (requires old password) */
  async passwordChange(keyspace: string, userId: string, oldPassword: string, newPassword: string): Promise<PasswordChangeResponse> {
    const args: string[] = [];
    args.push("PASSWORD", "CHANGE");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(oldPassword));
    args.push(String(newPassword));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      credentialId: m["credential_id"] as string,
      updatedAt: m["updated_at"] != null ? Number(m["updated_at"]) : undefined,
    } as PasswordChangeResponse;
  }

  /** Import a pre-hashed password for migration from another system (argon2, bcrypt, scrypt) */
  async passwordImport(keyspace: string, userId: string, hash: string, options?: { metadata?: Record<string, unknown> }): Promise<PasswordImportResponse> {
    const args: string[] = [];
    args.push("PASSWORD", "IMPORT");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(hash));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      credentialId: m["credential_id"] as string,
      userId: m["user_id"] as string,
      algorithm: m["algorithm"] as string,
      createdAt: m["created_at"] != null ? Number(m["created_at"]) : undefined,
    } as PasswordImportResponse;
  }

  /** Set a password for a user in a password keyspace */
  async passwordSet(keyspace: string, userId: string, password: string, options?: { metadata?: Record<string, unknown> }): Promise<PasswordSetResponse> {
    const args: string[] = [];
    args.push("PASSWORD", "SET");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(password));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      credentialId: m["credential_id"] as string,
      userId: m["user_id"] as string,
      algorithm: m["algorithm"] as string,
      createdAt: m["created_at"] != null ? Number(m["created_at"]) : undefined,
    } as PasswordSetResponse;
  }

  /** Verify a user's password */
  async passwordVerify(keyspace: string, userId: string, password: string): Promise<PasswordVerifyResponse> {
    const args: string[] = [];
    args.push("PASSWORD", "VERIFY");
    args.push(String(keyspace));
    args.push(String(userId));
    args.push(String(password));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      valid: m["valid"] as boolean,
      credentialId: m["credential_id"] as string,
      metadata: typeof m["metadata"] === "string" ? JSON.parse(m["metadata"] as string) : m["metadata"],
    } as PasswordVerifyResponse;
  }

  /** Exchange a refresh token for a new one */
  async refresh(keyspace: string, token: string): Promise<RefreshResponse> {
    const args: string[] = [];
    args.push("REFRESH");
    args.push(String(keyspace));
    args.push(String(token));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      credentialId: m["credential_id"] as string,
      token: m["token"] as string,
      familyId: m["family_id"] as string,
      expiresAt: m["expires_at"] != null ? Number(m["expires_at"]) : undefined,
    } as RefreshResponse;
  }

  /** Revoke a credential by ID */
  async revoke(keyspace: string, credentialId: string): Promise<RevokeResponse> {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(keyspace));
    args.push(String(credentialId));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      revoked: m["revoked"] != null ? Number(m["revoked"]) : undefined,
    } as RevokeResponse;
  }

  /** Bulk-revoke multiple credentials */
  async revokeBulk(keyspace: string, options?: { ids?: string[] }): Promise<RevokeBulkResponse> {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(keyspace));
    if (options?.ids) { args.push("BULK"); args.push(...options.ids); }
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      revoked: m["revoked"] != null ? Number(m["revoked"]) : undefined,
    } as RevokeBulkResponse;
  }

  /** Revoke all credentials in a refresh token family */
  async revokeFamily(keyspace: string, options?: { familyId?: string }): Promise<RevokeFamilyResponse> {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(keyspace));
    if (options?.familyId !== undefined) args.push("FAMILY", String(options.familyId));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      revoked: m["revoked"] != null ? Number(m["revoked"]) : undefined,
    } as RevokeFamilyResponse;
  }

  /** Trigger signing key rotation for a keyspace */
  async rotate(keyspace: string, options?: { force?: boolean; nowait?: boolean; dryrun?: boolean }): Promise<RotateResponse> {
    const args: string[] = [];
    args.push("ROTATE");
    args.push(String(keyspace));
    if (options?.force) args.push("FORCE");
    if (options?.nowait) args.push("NOWAIT");
    if (options?.dryrun) args.push("DRYRUN");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      newKeyId: m["new_key_id"] as string,
      oldKeyId: m["old_key_id"] as string,
      dryrun: m["dryrun"] as string,
    } as RotateResponse;
  }

  /** Display the metadata schema for a keyspace */
  async schema(keyspace: string): Promise<SchemaResponse> {
    const args: string[] = [];
    args.push("SCHEMA");
    args.push(String(keyspace));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      schema: typeof m["schema"] === "string" ? JSON.parse(m["schema"] as string) : m["schema"],
    } as SchemaResponse;
  }

  /** Subscribe to real-time event notifications */
  async subscribe(channel: string): Promise<Subscription> {
    const conn = await Connection.open(this._host, this._port, this._tls);
    if (this._auth) {
      await conn.execute("AUTH", this._auth);
    }
    const args: string[] = [];
    args.push("SUBSCRIBE");
    args.push(String(channel));
    const result = await conn.execute(...args);
    const status = (result as Record<string, unknown>)?.status;
    if (status !== "OK") {
      conn.close();
      throw new ShroudbError("SUBSCRIBE", `Subscribe failed: ${JSON.stringify(result)}`);
    }
    return new Subscription(conn);
  }

  /** Temporarily suspend a credential */
  async suspend(keyspace: string, credentialId: string): Promise<void> {
    const args: string[] = [];
    args.push("SUSPEND");
    args.push(String(keyspace));
    args.push(String(credentialId));
    const result = await this.execute(...args);
  }

  /** Reactivate a previously suspended credential */
  async unsuspend(keyspace: string, credentialId: string): Promise<void> {
    const args: string[] = [];
    args.push("UNSUSPEND");
    args.push(String(keyspace));
    args.push(String(credentialId));
    const result = await this.execute(...args);
  }

  /** Update metadata on an existing credential */
  async update(keyspace: string, credentialId: string, options?: { metadata?: Record<string, unknown> }): Promise<void> {
    const args: string[] = [];
    args.push("UPDATE");
    args.push(String(keyspace));
    args.push(String(credentialId));
    if (options?.metadata !== undefined) args.push("META", JSON.stringify(options.metadata));
    const result = await this.execute(...args);
  }

  /** Verify a credential (JWT, API key, or HMAC signature) */
  async verify(keyspace: string, token: string, options?: { payload?: string; checkRevoked?: boolean }): Promise<VerifyResponse> {
    const args: string[] = [];
    args.push("VERIFY");
    args.push(String(keyspace));
    args.push(String(token));
    if (options?.payload !== undefined) args.push("PAYLOAD", String(options.payload));
    if (options?.checkRevoked) args.push("CHECKREV");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      credentialId: m["credential_id"] as string,
      claims: typeof m["claims"] === "string" ? JSON.parse(m["claims"] as string) : m["claims"],
      meta: typeof m["meta"] === "string" ? JSON.parse(m["meta"] as string) : m["meta"],
      state: m["state"] as string,
    } as VerifyResponse;
  }
}
