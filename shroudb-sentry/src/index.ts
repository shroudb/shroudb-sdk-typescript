/**
 * ShroudbSentry — TypeScript client for the ShroudbSentry Policy-based authorization engine.
 *
 * Auto-generated from shroudb-sentry protocol spec. Do not edit.
 *
 * @example
 * ```ts
 * import { ShroudbSentryClient } from "shroudb-sentry-client";
 *
 * const client = await ShroudbSentryClient.connect("shroudb-sentry://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 * ```
 */

export { ShroudbSentryClient } from "./client";
export { Pipeline } from "./pipeline";
export { Subscription } from "./subscription";
export { ShroudbSentryError } from "./errors";
export type { AuthResponse, EvaluateResponse, KeyInfoResponse, KeyRotateResponse, PolicyInfoResponse, PolicyListResponse, PolicyReloadResponse, SubscriptionEvent } from "./types";
export { BadargError, DeniedError, InternalError, NokeyError, NotfoundError, NotreadyError } from "./errors";
