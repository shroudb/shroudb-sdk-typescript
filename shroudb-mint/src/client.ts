/**
 * ShroudbMint client.
 *
 * Auto-generated from shroudb-mint protocol spec. Do not edit.
 */

import { Connection, DEFAULT_PORT } from "./connection";
import { Pool, type PoolOptions } from "./pool";
import { Pipeline } from "./pipeline";
import { Subscription } from "./subscription";
import { ShroudbMintError } from "./errors";
import type { AuthResponse, CaCreateResponse, CaExportResponse, CaInfoResponse, CaListResponse, CaRotateResponse, CrlInfoResponse, InspectResponse, IssueResponse, IssueFromCsrResponse, ListCertsResponse, RenewResponse, RevokeResponse } from "./types";


/**
 * Parse a ShroudbMint connection URI.
 *
 * Supported formats:
 * - `shroudb-mint://localhost`
 * - `shroudb-mint://localhost:6699`
 * - `shroudb-mint+tls://prod.example.com`
 * - `shroudb-mint://mytoken@localhost:6699`
 * - `shroudb-mint://mytoken@localhost/sessions`
 * - `shroudb-mint+tls://tok@host:6699/keys`
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
  if (uri.startsWith("shroudb-mint+tls://")) {
    tls = true;
    rest = uri.slice("shroudb-mint+tls://".length);
  } else if (uri.startsWith("shroudb-mint://")) {
    rest = uri.slice("shroudb-mint://".length);
  } else {
    throw new ShroudbMintError("BADARG", `Invalid ShroudbMint URI: ${uri}  (expected shroudb-mint:// or shroudb-mint+tls://)`);
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
  let port = 6699;
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
 * Async client for the ShroudbMint Lightweight internal Certificate Authority.
 *
 * Connect using a ShroudbMint URI:
 *
 * ```ts
 * const client = await ShroudbMintClient.connect("shroudb-mint://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 *
 * // With TLS and auth:
 * const client = await ShroudbMintClient.connect("shroudb-mint+tls://mytoken@prod.example.com/keys");
 * ```
 */
export class ShroudbMintClient {
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
   * Connect to a ShroudbMint server.
   *
   * @param uri — ShroudbMint connection URI.
   *   Format: `shroudb-mint://[token@]host[:port][/keyspace]`
   *   or `shroudb-mint+tls://[token@]host[:port][/keyspace]`
   * @param poolOptions — Connection pool tuning.
   */
  static async connect(
    uri: string = "shroudb-mint://localhost",
    poolOptions?: PoolOptions,
  ): Promise<ShroudbMintClient> {
    const cfg = parseUri(uri);
    const pool = new Pool(cfg.host, cfg.port, cfg.tls, cfg.authToken, poolOptions);
    return new ShroudbMintClient(pool, cfg.host, cfg.port, cfg.tls, cfg.authToken);
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

  /** Create a new Certificate Authority */
  async caCreate(ca: string, algorithm: string, subject: string, ttlDays: number, options?: { parent?: string }): Promise<CaCreateResponse> {
    const args: string[] = [];
    args.push("CA_CREATE");
    args.push(String(ca));
    args.push(String(algorithm));
    args.push(String(subject));
    args.push(String(ttlDays));
    if (options?.parent !== undefined) args.push("PARENT", String(options.parent));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      ca: m["ca"] as string,
      serial: m["serial"] as string,
      certificate: m["certificate"] as string,
    } as CaCreateResponse;
  }

  /** Export the CA's public certificate */
  async caExport(ca: string, options?: { format?: string }): Promise<CaExportResponse> {
    const args: string[] = [];
    args.push("CA_EXPORT");
    args.push(String(ca));
    if (options?.format !== undefined) args.push("FORMAT", String(options.format));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      certificate: m["certificate"] as string,
    } as CaExportResponse;
  }

  /** Get information about a CA */
  async caInfo(ca: string): Promise<CaInfoResponse> {
    const args: string[] = [];
    args.push("CA_INFO");
    args.push(String(ca));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      ca: m["ca"] as string,
      algorithm: m["algorithm"] as string,
      subject: m["subject"] as string,
      serial: m["serial"] as string,
      notBefore: m["not_before"] as unknown,
      notAfter: m["not_after"] as unknown,
      issuedCount: m["issued_count"] as unknown,
    } as CaInfoResponse;
  }

  /** List all CAs */
  async caList(): Promise<CaListResponse> {
    const args: string[] = [];
    args.push("CA_LIST");
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      cas: m["cas"] as unknown,
    } as CaListResponse;
  }

  /** Rotate the CA's signing key */
  async caRotate(ca: string, options?: { force?: unknown; dryrun?: unknown }): Promise<CaRotateResponse> {
    const args: string[] = [];
    args.push("CA_ROTATE");
    args.push(String(ca));
    if (options?.force !== undefined) args.push("FORCE", String(options.force));
    if (options?.dryrun !== undefined) args.push("DRYRUN", String(options.dryrun));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      serial: m["serial"] as string,
      previousSerial: m["previous_serial"] as string,
    } as CaRotateResponse;
  }

  /** Get CRL information for a CA */
  async crlInfo(ca: string): Promise<CrlInfoResponse> {
    const args: string[] = [];
    args.push("CRL_INFO");
    args.push(String(ca));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      ca: m["ca"] as string,
      crlNumber: m["crl_number"] as unknown,
      lastUpdate: m["last_update"] as unknown,
      nextUpdate: m["next_update"] as unknown,
      revokedCount: m["revoked_count"] as unknown,
    } as CrlInfoResponse;
  }

  /** Check server health */
  async health(ca?: string): Promise<void> {
    const args: string[] = [];
    args.push("HEALTH");
    if (ca !== undefined) args.push(String(ca));
    const result = await this.execute(...args);
  }

  /** Inspect a certificate */
  async inspect(ca: string, serial: string): Promise<InspectResponse> {
    const args: string[] = [];
    args.push("INSPECT");
    args.push(String(ca));
    args.push(String(serial));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      serial: m["serial"] as string,
      subject: m["subject"] as string,
      notBefore: m["not_before"] as unknown,
      notAfter: m["not_after"] as unknown,
      state: m["state"] as string,
      certificate: m["certificate"] as string,
    } as InspectResponse;
  }

  /** Issue a new certificate */
  async issue(ca: string, subject: string, profile: string, options?: { ttl?: string; sanDns?: unknown; sanIp?: unknown }): Promise<IssueResponse> {
    const args: string[] = [];
    args.push("ISSUE");
    args.push(String(ca));
    args.push(String(subject));
    args.push(String(profile));
    if (options?.ttl !== undefined) args.push("TTL", String(options.ttl));
    if (options?.sanDns !== undefined) args.push("SAN_DNS", String(options.sanDns));
    if (options?.sanIp !== undefined) args.push("SAN_IP", String(options.sanIp));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      serial: m["serial"] as string,
      certificate: m["certificate"] as string,
      privateKey: m["private_key"] as string,
      chain: m["chain"] as string,
      notAfter: m["not_after"] as unknown,
    } as IssueResponse;
  }

  /** Issue a certificate from a CSR */
  async issueFromCsr(ca: string, csrPem: string, profile: string, options?: { ttl?: string }): Promise<IssueFromCsrResponse> {
    const args: string[] = [];
    args.push("ISSUE_FROM_CSR");
    args.push(String(ca));
    args.push(String(csrPem));
    args.push(String(profile));
    if (options?.ttl !== undefined) args.push("TTL", String(options.ttl));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      serial: m["serial"] as string,
      certificate: m["certificate"] as string,
      chain: m["chain"] as string,
      notAfter: m["not_after"] as unknown,
    } as IssueFromCsrResponse;
  }

  /** List certificates for a CA */
  async listCerts(ca: string, options?: { state?: string; limit?: unknown; offset?: unknown }): Promise<ListCertsResponse> {
    const args: string[] = [];
    args.push("LIST_CERTS");
    args.push(String(ca));
    if (options?.state !== undefined) args.push("STATE", String(options.state));
    if (options?.limit !== undefined) args.push("LIMIT", String(options.limit));
    if (options?.offset !== undefined) args.push("OFFSET", String(options.offset));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      certificates: m["certificates"] as unknown,
    } as ListCertsResponse;
  }

  /** Renew a certificate */
  async renew(ca: string, serial: string, options?: { ttl?: string }): Promise<RenewResponse> {
    const args: string[] = [];
    args.push("RENEW");
    args.push(String(ca));
    args.push(String(serial));
    if (options?.ttl !== undefined) args.push("TTL", String(options.ttl));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      serial: m["serial"] as string,
      certificate: m["certificate"] as string,
      privateKey: m["private_key"] as string,
      notAfter: m["not_after"] as unknown,
    } as RenewResponse;
  }

  /** Revoke a certificate */
  async revoke(ca: string, serial: string, options?: { reason?: string }): Promise<RevokeResponse> {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(ca));
    args.push(String(serial));
    if (options?.reason !== undefined) args.push("REASON", String(options.reason));
    const result = await this.execute(...args);
    const m = result as Record<string, unknown>;
    return {
      serial: m["serial"] as string,
      revokedAt: m["revoked_at"] as unknown,
    } as RevokeResponse;
  }
}
