/**
 * Shroudb response types.
 *
 * Auto-generated from shroudb protocol spec. Do not edit.
 */

/** Response from CONFIG command. */
export interface ConfigGetResponse {
  value: string;
}

/** Response from HEALTH command. */
export interface HealthResponse {
  state?: string;
  keyspaces?: Record<string, unknown>;
  count?: number;
}

/** Response from INSPECT command. */
export interface InspectResponse {
  credentialId: string;
  state: string;
  createdAt: number;
  expiresAt?: number;
  lastVerifiedAt?: number;
  meta?: Record<string, unknown>;
  familyId?: string;
}

/** Response from ISSUE command. */
export interface IssueResponse {
  credentialId: string;
  token: string;
  expiresAt?: number;
  familyId?: string;
}

/** Response from JWKS command. */
export interface JwksResponse {
  keys: Record<string, unknown>;
}

/** Response from KEYS command. */
export interface KeysResponse {
  cursor: string;
  keys: Record<string, unknown>;
}

/** Response from KEYSTATE command. */
export interface KeystateResponse {
  keys: Record<string, unknown>;
}

/** Response from PASSWORD command. */
export interface PasswordChangeResponse {
  credentialId: string;
  updatedAt: number;
}

/** Response from PASSWORD command. */
export interface PasswordImportResponse {
  credentialId: string;
  userId: string;
  algorithm: string;
  createdAt: number;
}

/** Response from PASSWORD command. */
export interface PasswordSetResponse {
  credentialId: string;
  userId: string;
  algorithm: string;
  createdAt: number;
}

/** Response from PASSWORD command. */
export interface PasswordVerifyResponse {
  valid: boolean;
  credentialId: string;
  metadata?: Record<string, unknown>;
}

/** Response from REFRESH command. */
export interface RefreshResponse {
  credentialId: string;
  token: string;
  familyId: string;
  expiresAt: number;
}

/** Response from REVOKE command. */
export interface RevokeResponse {
  revoked?: number;
}

/** Response from REVOKE command. */
export interface RevokeBulkResponse {
  revoked: number;
}

/** Response from REVOKE command. */
export interface RevokeFamilyResponse {
  revoked: number;
}

/** Response from ROTATE command. */
export interface RotateResponse {
  newKeyId: string;
  oldKeyId: string;
  dryrun?: string;
}

/** Response from SCHEMA command. */
export interface SchemaResponse {
  schema: Record<string, unknown>;
}

/** Response from VERIFY command. */
export interface VerifyResponse {
  credentialId: string;
  claims?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  state: string;
}

/** Event received from a streaming subscription. */
export interface SubscriptionEvent {
  eventType: string;
  keyspace: string;
  detail: string;
  timestamp: number;
}
