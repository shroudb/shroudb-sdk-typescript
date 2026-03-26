/**
 * ShroudbTransit pipeline for batching commands into a single round-trip.
 *
 * Auto-generated from shroudb-transit protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import type { Pool } from "./pool";
import type { DecryptResponse, EncryptResponse, GenerateDataKeyResponse, KeyInfoResponse, RewrapResponse, RotateResponse, SignResponse, VerifySignatureResponse } from "./types";

type Parser<T> = (raw: unknown) => T;

/**
 * Pipeline for batching ShroudbTransit commands into a single round-trip.
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

  /** Decrypt ciphertext using the embedded key version */
  decrypt(keyring: string, ciphertext: string, options?: { context?: unknown }): this {
    const args: string[] = [];
    args.push("DECRYPT");
    args.push(String(keyring));
    args.push(String(ciphertext));
    if (options?.context !== undefined) args.push("CONTEXT", String(options.context));
    this.commands.push({ args, parser: (raw) => raw as DecryptResponse });
    return this;
  }

  /** Encrypt plaintext with the active key version */
  encrypt(keyring: string, plaintext: string, options?: { context?: unknown; keyVersion?: number; convergent?: unknown }): this {
    const args: string[] = [];
    args.push("ENCRYPT");
    args.push(String(keyring));
    args.push(String(plaintext));
    if (options?.context !== undefined) args.push("CONTEXT", String(options.context));
    if (options?.keyVersion !== undefined) args.push("KEY_VERSION", String(options.keyVersion));
    if (options?.convergent !== undefined) args.push("CONVERGENT", String(options.convergent));
    this.commands.push({ args, parser: (raw) => raw as EncryptResponse });
    return this;
  }

  /** Generate a data encryption key (envelope encryption pattern) */
  generateDataKey(keyring: string, options?: { bits?: number }): this {
    const args: string[] = [];
    args.push("GENERATE_DATA_KEY");
    args.push(String(keyring));
    if (options?.bits !== undefined) args.push("BITS", String(options.bits));
    this.commands.push({ args, parser: (raw) => raw as GenerateDataKeyResponse });
    return this;
  }

  /** Check server health */
  health(keyring?: string): this {
    const args: string[] = [];
    args.push("HEALTH");
    if (keyring !== undefined) args.push(String(keyring));
    this.commands.push({ args, parser: null });
    return this;
  }

  /** Get keyring metadata and key version information */
  keyInfo(keyring: string): this {
    const args: string[] = [];
    args.push("KEY_INFO");
    args.push(String(keyring));
    this.commands.push({ args, parser: (raw) => raw as KeyInfoResponse });
    return this;
  }

  /** Re-encrypt ciphertext with the current active key version */
  rewrap(keyring: string, ciphertext: string, options?: { context?: unknown }): this {
    const args: string[] = [];
    args.push("REWRAP");
    args.push(String(keyring));
    args.push(String(ciphertext));
    if (options?.context !== undefined) args.push("CONTEXT", String(options.context));
    this.commands.push({ args, parser: (raw) => raw as RewrapResponse });
    return this;
  }

  /** Rotate the keyring to a new key version */
  rotate(keyring: string, options?: { force?: unknown; dryrun?: unknown }): this {
    const args: string[] = [];
    args.push("ROTATE");
    args.push(String(keyring));
    if (options?.force !== undefined) args.push("FORCE", String(options.force));
    if (options?.dryrun !== undefined) args.push("DRYRUN", String(options.dryrun));
    this.commands.push({ args, parser: (raw) => raw as RotateResponse });
    return this;
  }

  /** Create a detached signature */
  sign(keyring: string, data: string, options?: { algorithm?: unknown }): this {
    const args: string[] = [];
    args.push("SIGN");
    args.push(String(keyring));
    args.push(String(data));
    if (options?.algorithm !== undefined) args.push("ALGORITHM", String(options.algorithm));
    this.commands.push({ args, parser: (raw) => raw as SignResponse });
    return this;
  }

  /** Verify a detached signature */
  verifySignature(keyring: string, data: string, signature: string): this {
    const args: string[] = [];
    args.push("VERIFY_SIGNATURE");
    args.push(String(keyring));
    args.push(String(data));
    args.push(String(signature));
    this.commands.push({ args, parser: (raw) => raw as VerifySignatureResponse });
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
