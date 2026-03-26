/**
 * ShroudbMint pipeline for batching commands into a single round-trip.
 *
 * Auto-generated from shroudb-mint protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import type { Pool } from "./pool";
import type { AuthResponse, CaCreateResponse, CaExportResponse, CaInfoResponse, CaListResponse, CaRotateResponse, CrlInfoResponse, InspectResponse, IssueResponse, IssueFromCsrResponse, ListCertsResponse, RenewResponse, RevokeResponse } from "./types";

type Parser<T> = (raw: unknown) => T;

/**
 * Pipeline for batching ShroudbMint commands into a single round-trip.
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

  /** Create a new Certificate Authority */
  caCreate(ca: string, algorithm: string, subject: string, ttlDays: number, options?: { parent?: string }): this {
    const args: string[] = [];
    args.push("CA_CREATE");
    args.push(String(ca));
    args.push(String(algorithm));
    args.push(String(subject));
    args.push(String(ttlDays));
    if (options?.parent !== undefined) args.push("PARENT", String(options.parent));
    this.commands.push({ args, parser: (raw) => raw as CaCreateResponse });
    return this;
  }

  /** Export the CA's public certificate */
  caExport(ca: string, options?: { format?: string }): this {
    const args: string[] = [];
    args.push("CA_EXPORT");
    args.push(String(ca));
    if (options?.format !== undefined) args.push("FORMAT", String(options.format));
    this.commands.push({ args, parser: (raw) => raw as CaExportResponse });
    return this;
  }

  /** Get information about a CA */
  caInfo(ca: string): this {
    const args: string[] = [];
    args.push("CA_INFO");
    args.push(String(ca));
    this.commands.push({ args, parser: (raw) => raw as CaInfoResponse });
    return this;
  }

  /** List all CAs */
  caList(): this {
    const args: string[] = [];
    args.push("CA_LIST");
    this.commands.push({ args, parser: (raw) => raw as CaListResponse });
    return this;
  }

  /** Rotate the CA's signing key */
  caRotate(ca: string, options?: { force?: unknown; dryrun?: unknown }): this {
    const args: string[] = [];
    args.push("CA_ROTATE");
    args.push(String(ca));
    if (options?.force !== undefined) args.push("FORCE", String(options.force));
    if (options?.dryrun !== undefined) args.push("DRYRUN", String(options.dryrun));
    this.commands.push({ args, parser: (raw) => raw as CaRotateResponse });
    return this;
  }

  /** Get CRL information for a CA */
  crlInfo(ca: string): this {
    const args: string[] = [];
    args.push("CRL_INFO");
    args.push(String(ca));
    this.commands.push({ args, parser: (raw) => raw as CrlInfoResponse });
    return this;
  }

  /** Check server health */
  health(ca?: string): this {
    const args: string[] = [];
    args.push("HEALTH");
    if (ca !== undefined) args.push(String(ca));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Inspect a certificate */
  inspect(ca: string, serial: string): this {
    const args: string[] = [];
    args.push("INSPECT");
    args.push(String(ca));
    args.push(String(serial));
    this.commands.push({ args, parser: (raw) => raw as InspectResponse });
    return this;
  }

  /** Issue a new certificate */
  issue(ca: string, subject: string, profile: string, options?: { ttl?: string; sanDns?: unknown; sanIp?: unknown }): this {
    const args: string[] = [];
    args.push("ISSUE");
    args.push(String(ca));
    args.push(String(subject));
    args.push(String(profile));
    if (options?.ttl !== undefined) args.push("TTL", String(options.ttl));
    if (options?.sanDns !== undefined) args.push("SAN_DNS", String(options.sanDns));
    if (options?.sanIp !== undefined) args.push("SAN_IP", String(options.sanIp));
    this.commands.push({ args, parser: (raw) => raw as IssueResponse });
    return this;
  }

  /** Issue a certificate from a CSR */
  issueFromCsr(ca: string, csrPem: string, profile: string, options?: { ttl?: string }): this {
    const args: string[] = [];
    args.push("ISSUE_FROM_CSR");
    args.push(String(ca));
    args.push(String(csrPem));
    args.push(String(profile));
    if (options?.ttl !== undefined) args.push("TTL", String(options.ttl));
    this.commands.push({ args, parser: (raw) => raw as IssueFromCsrResponse });
    return this;
  }

  /** List certificates for a CA */
  listCerts(ca: string, options?: { state?: string; limit?: unknown; offset?: unknown }): this {
    const args: string[] = [];
    args.push("LIST_CERTS");
    args.push(String(ca));
    if (options?.state !== undefined) args.push("STATE", String(options.state));
    if (options?.limit !== undefined) args.push("LIMIT", String(options.limit));
    if (options?.offset !== undefined) args.push("OFFSET", String(options.offset));
    this.commands.push({ args, parser: (raw) => raw as ListCertsResponse });
    return this;
  }

  /** Renew a certificate */
  renew(ca: string, serial: string, options?: { ttl?: string }): this {
    const args: string[] = [];
    args.push("RENEW");
    args.push(String(ca));
    args.push(String(serial));
    if (options?.ttl !== undefined) args.push("TTL", String(options.ttl));
    this.commands.push({ args, parser: (raw) => raw as RenewResponse });
    return this;
  }

  /** Revoke a certificate */
  revoke(ca: string, serial: string, options?: { reason?: string }): this {
    const args: string[] = [];
    args.push("REVOKE");
    args.push(String(ca));
    args.push(String(serial));
    if (options?.reason !== undefined) args.push("REASON", String(options.reason));
    this.commands.push({ args, parser: (raw) => raw as RevokeResponse });
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
