/**
 * ShroudbKeep — TypeScript client for the ShroudbKeep Secrets manager.
 *
 * Auto-generated from shroudb-keep protocol spec. Do not edit.
 *
 * @example
 * ```ts
 * import { ShroudbKeepClient } from "shroudb-keep-client";
 *
 * const client = await ShroudbKeepClient.connect("shroudb-keep://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 * ```
 */

export { ShroudbKeepClient } from "./client";
export { Pipeline } from "./pipeline";
export { Subscription } from "./subscription";
export { ShroudbKeepError } from "./errors";
export type { AuthResponse, DeleteResponse, GetResponse, ListResponse, PutResponse, RotateResponse, VersionsResponse, SubscriptionEvent } from "./types";
export { BadargError, DeletedError, DeniedError, InternalError, NotfoundError, NotreadyError, StorageError } from "./errors";
