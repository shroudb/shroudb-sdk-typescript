/**
 * ShroudbKeep response types.
 *
 * Auto-generated from shroudb-keep protocol spec. Do not edit.
 */

/** Response from AUTH command. */
export interface AuthResponse {
  status: unknown;
}

/** Response from DELETE command. */
export interface DeleteResponse {
  path: string;
  deletedAt: unknown;
}

/** Response from GET command. */
export interface GetResponse {
  path: string;
  value: string;
  version: number;
  meta?: string;
  createdAt: unknown;
}

/** Response from LIST command. */
export interface ListResponse {
  paths: unknown;
}

/** Response from PUT command. */
export interface PutResponse {
  path: string;
  version: number;
}

/** Response from ROTATE command. */
export interface RotateResponse {
  path: string;
  version: number;
}

/** Response from VERSIONS command. */
export interface VersionsResponse {
  path: string;
  versions: unknown;
}

/** Event received from a streaming subscription. */
export interface SubscriptionEvent {
  eventType: string;
  keyspace: string;
  detail: string;
  timestamp: number;
}
