/**
 * ShroudbCourier response types.
 *
 * Auto-generated from shroudb-courier protocol spec. Do not edit.
 */

/** Response from AUTH command. */
export interface AuthResponse {
  status: unknown;
}

/** Response from CHANNEL_INFO command. */
export interface ChannelInfoResponse {
  channel: unknown;
  subscribers: unknown;
}

/** Response from CHANNEL_LIST command. */
export interface ChannelListResponse {
  channels: unknown;
}

/** Response from CONNECTIONS command. */
export interface ConnectionsResponse {
  connections: unknown;
}

/** Response from DELIVER command. */
export interface DeliverResponse {
  deliveryId: string;
  channel: string;
  status: unknown;
}

/** Response from TEMPLATE_INFO command. */
export interface TemplateInfoResponse {
  name: string;
  channels: unknown;
  variables: unknown;
  loadedAt: unknown;
}

/** Response from TEMPLATE_LIST command. */
export interface TemplateListResponse {
  templates: unknown;
}

/** Response from TEMPLATE_RELOAD command. */
export interface TemplateReloadResponse {
  count: unknown;
}

/** Event received from a streaming subscription. */
export interface SubscriptionEvent {
  eventType: string;
  keyspace: string;
  detail: string;
  timestamp: number;
}
