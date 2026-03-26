/**
 * Streaming subscription for ShroudbCourier events.
 *
 * Auto-generated from shroudb-courier protocol spec. Do not edit.
 */

import { Connection } from "./connection";
import { ShroudbCourierError } from "./errors";
import type { SubscriptionEvent } from "./types";

/**
 * A subscription that streams events from the server.
 *
 * Implements `AsyncIterable<SubscriptionEvent>` so you can use `for await`:
 *
 * ```ts
 * const sub = await client.subscribe("my-channel");
 * for await (const event of sub) {
 *   console.log(event.eventType, event.keyspace, event.detail);
 * }
 * ```
 */
export class Subscription implements AsyncIterable<SubscriptionEvent> {
  private closed = false;

  /** @internal */
  constructor(private readonly conn: Connection) {}

  async *[Symbol.asyncIterator](): AsyncIterableIterator<SubscriptionEvent> {
    while (!this.closed) {
      let frame: unknown;
      try {
        frame = await this.conn.readResponse();
      } catch (_) {
        // Connection closed or errored — end iteration.
        this.closed = true;
        return;
      }

      if (!Array.isArray(frame) || frame.length < 5) {
        continue;
      }

      const [tag, eventType, keyspace, detail, timestamp] = frame as [
        string,
        string,
        string,
        string,
        number,
      ];

      if (tag !== "event") {
        continue;
      }

      yield {
        eventType: String(eventType),
        keyspace: String(keyspace),
        detail: String(detail),
        timestamp: Number(timestamp),
      };
    }
  }

  /** Close the subscription and its underlying connection. */
  close(): void {
    if (!this.closed) {
      this.closed = true;
      this.conn.close();
    }
  }
}
