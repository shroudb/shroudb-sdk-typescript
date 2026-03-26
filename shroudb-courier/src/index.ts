/**
 * ShroudbCourier — TypeScript client for the ShroudbCourier Secure notification delivery pipeline.
 *
 * Auto-generated from shroudb-courier protocol spec. Do not edit.
 *
 * @example
 * ```ts
 * import { ShroudbCourierClient } from "shroudb-courier-client";
 *
 * const client = await ShroudbCourierClient.connect("shroudb-courier://localhost");
 * const result = await client.issue("my-keyspace", { ttlSecs: 3600 });
 * console.log(result.credentialId, result.token);
 * client.close();
 * ```
 */

export { ShroudbCourierClient } from "./client";
export { Pipeline } from "./pipeline";
export { Subscription } from "./subscription";
export { ShroudbCourierError } from "./errors";
export type { AuthResponse, ChannelInfoResponse, ChannelListResponse, ConnectionsResponse, DeliverResponse, TemplateInfoResponse, TemplateListResponse, TemplateReloadResponse, SubscriptionEvent } from "./types";
export { BadargError, DeliveryFailedError, DeniedError, InternalError, NotfoundError, NotreadyError, TemplateErrorError } from "./errors";
