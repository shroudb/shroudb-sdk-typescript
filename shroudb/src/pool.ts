/**
 * Internal connection pool.
 *
 * This module is an implementation detail of the Shroudb client library.
 * Do not import directly — use `ShroudbClient` instead.
 *
 * Auto-generated from shroudb protocol spec. Do not edit.
 */

import { Connection } from "./connection";

/** @internal */
export interface PoolOptions {
  /** Maximum idle connections to keep (default: 4). */
  maxIdle?: number;
  /** Maximum total connections, 0 = unlimited (default: 0). */
  maxOpen?: number;
}

/** @internal */
export class Pool {
  private idle: Connection[] = [];
  private open = 0;
  private readonly maxIdle: number;
  private readonly maxOpen: number;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly tls: boolean,
    private readonly auth: string | undefined,
    opts: PoolOptions = {},
  ) {
    this.maxIdle = opts.maxIdle ?? 4;
    this.maxOpen = opts.maxOpen ?? 0;
  }

  async get(): Promise<Connection> {
    if (this.idle.length > 0) {
      return this.idle.pop()!;
    }

    this.open++;
    try {
      const conn = await Connection.open(this.host, this.port, this.tls);
      if (this.auth) {
        await conn.execute("AUTH", this.auth);
      }
      return conn;
    } catch (e) {
      this.open--;
      throw e;
    }
  }

  put(conn: Connection): void {
    if (this.idle.length < this.maxIdle) {
      this.idle.push(conn);
    } else {
      conn.close();
      this.open--;
    }
  }

  close(): void {
    for (const conn of this.idle) {
      conn.close();
    }
    this.idle = [];
    this.open = 0;
  }
}
