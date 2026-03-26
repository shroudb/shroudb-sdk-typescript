/**
 * ShroudbPulse response types.
 *
 * Auto-generated from shroudb-pulse protocol spec. Do not edit.
 */

/** Response from ACTORS command. */
export interface ActorsResponse {
  actors: unknown;
}

/** Response from AUTH command. */
export interface AuthResponse {
  status: unknown;
}

/** Response from COUNT command. */
export interface CountResponse {
  count: unknown;
}

/** Response from ERRORS command. */
export interface ErrorsResponse {
  errorRates: unknown;
}

/** Response from HOTSPOTS command. */
export interface HotspotsResponse {
  hotspots: unknown;
}

/** Response from INGEST command. */
export interface IngestResponse {
  id: unknown;
}

/** Response from INGEST_BATCH command. */
export interface IngestBatchResponse {
  count: unknown;
  ids: unknown;
}

/** Response from QUERY command. */
export interface QueryResponse {
  events: unknown;
}

/** Response from SOURCE_LIST command. */
export interface SourceListResponse {
  sources: unknown;
}

/** Response from SOURCE_STATUS command. */
export interface SourceStatusResponse {
  sources: unknown;
}

/** Event received from a streaming subscription. */
export interface SubscriptionEvent {
  eventType: string;
  keyspace: string;
  detail: string;
  timestamp: number;
}
