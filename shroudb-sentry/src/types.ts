/**
 * ShroudbSentry response types.
 *
 * Auto-generated from shroudb-sentry protocol spec. Do not edit.
 */

/** Response from AUTH command. */
export interface AuthResponse {
  status: unknown;
}

/** Response from EVALUATE command. */
export interface EvaluateResponse {
  decision: string;
  token: string;
  reasons: unknown;
}

/** Response from KEY_INFO command. */
export interface KeyInfoResponse {
  keyId: unknown;
  algorithm: unknown;
  createdAt: unknown;
}

/** Response from KEY_ROTATE command. */
export interface KeyRotateResponse {
  keyId: unknown;
  previousKeyId?: unknown;
}

/** Response from POLICY_INFO command. */
export interface PolicyInfoResponse {
  name: string;
  version: unknown;
  rules: unknown;
  loadedAt: unknown;
}

/** Response from POLICY_LIST command. */
export interface PolicyListResponse {
  policies: unknown;
}

/** Response from POLICY_RELOAD command. */
export interface PolicyReloadResponse {
  count: unknown;
}

/** Event received from a streaming subscription. */
export interface SubscriptionEvent {
  eventType: string;
  keyspace: string;
  detail: string;
  timestamp: number;
}
