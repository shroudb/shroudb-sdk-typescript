/**
 * Internal ShroudbMint protocol codec.
 *
 * This module is an implementation detail of the ShroudbMint client library.
 * Do not import directly — use `ShroudbMintClient` instead.
 *
 * Auto-generated from shroudb-mint protocol spec. Do not edit.
 */

import { createConnection, Socket } from "net";
import { connect as tlsConnect, TLSSocket } from "tls";
import { ShroudbMintError } from "./errors";

export const DEFAULT_PORT = 6699;

type WireValue = string | number | null | WireValue[] | Record<string, WireValue>;

/** @internal */
export class Connection {
  private buffer = "";
  private resolveQueue: Array<(value: WireValue) => void> = [];
  private rejectQueue: Array<(reason: Error) => void> = [];

  private constructor(private socket: Socket | TLSSocket) {
    socket.setEncoding("utf-8");
    socket.on("data", (chunk: string) => {
      this.buffer += chunk;
      this.drain();
    });
    socket.on("error", (err) => {
      for (const reject of this.rejectQueue) {
        reject(err);
      }
      this.resolveQueue = [];
      this.rejectQueue = [];
    });
  }

  /** @internal */
  static async open(host: string, port: number, tls: boolean): Promise<Connection> {
    return new Promise((resolve, reject) => {
      if (tls) {
        const socket = tlsConnect({ host, port }, () => resolve(new Connection(socket)));
        socket.on("error", reject);
      } else {
        const socket = createConnection({ host, port }, () => resolve(new Connection(socket)));
        socket.on("error", reject);
      }
    });
  }

  /** @internal */
  async execute(...args: string[]): Promise<WireValue> {
    let cmd = `*${args.length}\r\n`;
    for (const arg of args) {
      const bytes = Buffer.byteLength(arg, "utf-8");
      cmd += `$${bytes}\r\n${arg}\r\n`;
    }
    this.socket.write(cmd);

    return new Promise<WireValue>((resolve, reject) => {
      this.resolveQueue.push(resolve);
      this.rejectQueue.push(reject);
      this.drain();
    });
  }

  /** @internal Buffer a command without reading the response. */
  sendCommand(...args: string[]): void {
    let cmd = `*${args.length}\r\n`;
    for (const arg of args) {
      const bytes = Buffer.byteLength(arg, "utf-8");
      cmd += `$${bytes}\r\n${arg}\r\n`;
    }
    this.socket.write(cmd);
  }

  /** @internal Read a single response from the server. */
  readResponse(): Promise<WireValue> {
    return new Promise<WireValue>((resolve, reject) => {
      this.resolveQueue.push(resolve);
      this.rejectQueue.push(reject);
      this.drain();
    });
  }

  /** @internal */
  close(): void {
    this.socket.end();
  }

  private drain(): void {
    while (this.resolveQueue.length > 0) {
      const result = this.tryParse();
      if (result === undefined) break;
      const resolve = this.resolveQueue.shift()!;
      this.rejectQueue.shift();
      resolve(result.value);
    }
  }

  private tryParse(): { value: WireValue; rest: string } | undefined {
    return this.parseFrame(this.buffer);
  }

  private parseFrame(
    buf: string,
  ): { value: WireValue; rest: string } | undefined {
    const nlIdx = buf.indexOf("\r\n");
    if (nlIdx < 0) return undefined;

    const tag = buf[0];
    const payload = buf.substring(1, nlIdx);
    const after = buf.substring(nlIdx + 2);

    switch (tag) {
      case "+":
        this.buffer = after;
        return { value: payload, rest: after };
      case "-": {
        const spaceIdx = payload.indexOf(" ");
        const code = spaceIdx >= 0 ? payload.substring(0, spaceIdx) : payload;
        const detail = spaceIdx >= 0 ? payload.substring(spaceIdx + 1) : "";
        this.buffer = after;
        const reject = this.rejectQueue.shift();
        this.resolveQueue.shift();
        if (reject) reject(ShroudbMintError._fromServer(code, detail));
        return undefined;
      }
      case ":":
        this.buffer = after;
        return { value: parseInt(payload, 10), rest: after };
      case "$": {
        const len = parseInt(payload, 10);
        if (len < 0) {
          this.buffer = after;
          return { value: null, rest: after };
        }
        if (after.length < len + 2) return undefined;
        const data = after.substring(0, len);
        const rest = after.substring(len + 2);
        this.buffer = rest;
        return { value: data, rest };
      }
      case "*": {
        const count = parseInt(payload, 10);
        let remaining = after;
        const arr: WireValue[] = [];
        for (let i = 0; i < count; i++) {
          const sub = this.parseFrameFrom(remaining);
          if (!sub) return undefined;
          arr.push(sub.value);
          remaining = sub.rest;
        }
        this.buffer = remaining;
        return { value: arr, rest: remaining };
      }
      case "%": {
        const count = parseInt(payload, 10);
        let remaining = after;
        const map: Record<string, WireValue> = {};
        for (let i = 0; i < count; i++) {
          const keyFrame = this.parseFrameFrom(remaining);
          if (!keyFrame) return undefined;
          remaining = keyFrame.rest;
          const valFrame = this.parseFrameFrom(remaining);
          if (!valFrame) return undefined;
          remaining = valFrame.rest;
          map[String(keyFrame.value)] = valFrame.value;
        }
        this.buffer = remaining;
        return { value: map, rest: remaining };
      }
      case "_":
        this.buffer = after;
        return { value: null, rest: after };
      default:
        throw new ShroudbMintError("INTERNAL", `Unknown response type: ${tag}`);
    }
  }

  private parseFrameFrom(
    buf: string,
  ): { value: WireValue; rest: string } | undefined {
    const saved = this.buffer;
    this.buffer = buf;
    const result = this.tryParse();
    if (!result) {
      this.buffer = saved;
      return undefined;
    }
    const rest = this.buffer;
    this.buffer = saved;
    return { value: result.value, rest };
  }
}
