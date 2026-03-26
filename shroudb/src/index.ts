/**
 * Shroudb — TypeScript client for the Shroudb Credential management server.
 *
 * Auto-generated from shroudb protocol spec. Do not edit.
 *
 * @example
 * ```ts
 * import { ShroudbClient } from "shroudb-client";
 *
 * const client = await ShroudbClient.connect("shroudb://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 * ```
 */

export { ShroudbClient } from "./client";
export { Pipeline } from "./pipeline";
export { Subscription } from "./subscription";
export { ShroudbError } from "./errors";
export type { ConfigGetResponse, HealthResponse, InspectResponse, IssueResponse, JwksResponse, KeysResponse, KeystateResponse, PasswordChangeResponse, PasswordImportResponse, PasswordSetResponse, PasswordVerifyResponse, RefreshResponse, RevokeResponse, RevokeBulkResponse, RevokeFamilyResponse, RotateResponse, SchemaResponse, VerifyResponse, SubscriptionEvent } from "./types";
export { BadargError, ChainLimitError, CryptoError, DeniedError, DisabledError, ExpiredError, InternalError, LockedError, NotfoundError, NotreadyError, ReuseDetectedError, StateErrorError, StorageError, ValidationErrorError, WrongtypeError } from "./errors";
