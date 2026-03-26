/**
 * ShroudbMint response types.
 *
 * Auto-generated from shroudb-mint protocol spec. Do not edit.
 */

/** Response from AUTH command. */
export interface AuthResponse {
  status: unknown;
}

/** Response from CA_CREATE command. */
export interface CaCreateResponse {
  ca: string;
  serial: string;
  certificate: string;
}

/** Response from CA_EXPORT command. */
export interface CaExportResponse {
  certificate: string;
}

/** Response from CA_INFO command. */
export interface CaInfoResponse {
  ca: string;
  algorithm: string;
  subject: string;
  serial: string;
  notBefore: unknown;
  notAfter: unknown;
  issuedCount: unknown;
}

/** Response from CA_LIST command. */
export interface CaListResponse {
  cas: unknown;
}

/** Response from CA_ROTATE command. */
export interface CaRotateResponse {
  serial: string;
  previousSerial?: string;
}

/** Response from CRL_INFO command. */
export interface CrlInfoResponse {
  ca: string;
  crlNumber: unknown;
  lastUpdate: unknown;
  nextUpdate: unknown;
  revokedCount: unknown;
}

/** Response from INSPECT command. */
export interface InspectResponse {
  serial: string;
  subject: string;
  notBefore: unknown;
  notAfter: unknown;
  state: string;
  certificate: string;
}

/** Response from ISSUE command. */
export interface IssueResponse {
  serial: string;
  certificate: string;
  privateKey: string;
  chain: string;
  notAfter: unknown;
}

/** Response from ISSUE_FROM_CSR command. */
export interface IssueFromCsrResponse {
  serial: string;
  certificate: string;
  chain: string;
  notAfter: unknown;
}

/** Response from LIST_CERTS command. */
export interface ListCertsResponse {
  certificates: unknown;
}

/** Response from RENEW command. */
export interface RenewResponse {
  serial: string;
  certificate: string;
  privateKey: string;
  notAfter: unknown;
}

/** Response from REVOKE command. */
export interface RevokeResponse {
  serial: string;
  revokedAt: unknown;
}

/** Event received from a streaming subscription. */
export interface SubscriptionEvent {
  eventType: string;
  keyspace: string;
  detail: string;
  timestamp: number;
}
