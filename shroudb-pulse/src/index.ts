/**
 * ShroudbPulse — TypeScript client for the ShroudbPulse Observability plane for unified audit event streaming.
 *
 * Auto-generated from shroudb-pulse protocol spec. Do not edit.
 *
 * @example
 * ```ts
 * import { ShroudbPulseClient } from "shroudb-pulse-client";
 *
 * const client = await ShroudbPulseClient.connect("shroudb-pulse://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 * ```
 */

export { ShroudbPulseClient } from "./client";
export { Pipeline } from "./pipeline";
export { Subscription } from "./subscription";
export { ShroudbPulseError } from "./errors";
export type { ActorsResponse, AuthResponse, CountResponse, ErrorsResponse, HotspotsResponse, IngestResponse, IngestBatchResponse, QueryResponse, SourceListResponse, SourceStatusResponse, SubscriptionEvent } from "./types";
export { BadargError, DeniedError, InternalError, NotfoundError, NotreadyError, StorageError } from "./errors";
