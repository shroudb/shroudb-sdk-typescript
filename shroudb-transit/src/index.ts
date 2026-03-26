/**
 * ShroudbTransit — TypeScript client for the ShroudbTransit Encryption-as-a-service.
 *
 * Auto-generated from shroudb-transit protocol spec. Do not edit.
 *
 * @example
 * ```ts
 * import { ShroudbTransitClient } from "shroudb-transit-client";
 *
 * const client = await ShroudbTransitClient.connect("shroudb-transit://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 * ```
 */

export { ShroudbTransitClient } from "./client";
export { Pipeline } from "./pipeline";
export { Subscription } from "./subscription";
export { ShroudbTransitError } from "./errors";
export type { DecryptResponse, EncryptResponse, GenerateDataKeyResponse, KeyInfoResponse, RewrapResponse, RotateResponse, SignResponse, VerifySignatureResponse, SubscriptionEvent } from "./types";
export { BadargError, DeniedError, DisabledError, InternalError, NotfoundError, NotreadyError, WrongtypeError } from "./errors";
