/**
 * ShroudbMint — TypeScript client for the ShroudbMint Lightweight internal Certificate Authority.
 *
 * Auto-generated from shroudb-mint protocol spec. Do not edit.
 *
 * @example
 * ```ts
 * import { ShroudbMintClient } from "shroudb-mint-client";
 *
 * const client = await ShroudbMintClient.connect("shroudb-mint://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 * ```
 */

export { ShroudbMintClient } from "./client";
export { Pipeline } from "./pipeline";
export { Subscription } from "./subscription";
export { ShroudbMintError } from "./errors";
export type { AuthResponse, CaCreateResponse, CaExportResponse, CaInfoResponse, CaListResponse, CaRotateResponse, CrlInfoResponse, InspectResponse, IssueResponse, IssueFromCsrResponse, ListCertsResponse, RenewResponse, RevokeResponse, SubscriptionEvent } from "./types";
export { BadargError, DeniedError, DisabledError, ExistsError, InternalError, NokeyError, NotfoundError, NotreadyError, StorageError } from "./errors";
