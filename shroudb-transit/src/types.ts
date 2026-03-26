/**
 * ShroudbTransit response types.
 *
 * Auto-generated from shroudb-transit protocol spec. Do not edit.
 */

/** Response from DECRYPT command. */
export interface DecryptResponse {
  plaintext: string;
}

/** Response from ENCRYPT command. */
export interface EncryptResponse {
  ciphertext: string;
  keyVersion: number;
}

/** Response from GENERATE_DATA_KEY command. */
export interface GenerateDataKeyResponse {
  plaintextKey: string;
  wrappedKey: string;
  keyVersion: number;
}

/** Response from KEY_INFO command. */
export interface KeyInfoResponse {
  keyring: string;
  type: unknown;
  activeVersion: number;
  versions: unknown;
}

/** Response from REWRAP command. */
export interface RewrapResponse {
  ciphertext: string;
  keyVersion: number;
}

/** Response from ROTATE command. */
export interface RotateResponse {
  keyVersion: number;
  previousVersion?: number;
}

/** Response from SIGN command. */
export interface SignResponse {
  signature: string;
  keyVersion: number;
}

/** Response from VERIFY_SIGNATURE command. */
export interface VerifySignatureResponse {
  valid: unknown;
}

/** Event received from a streaming subscription. */
export interface SubscriptionEvent {
  eventType: string;
  keyspace: string;
  detail: string;
  timestamp: number;
}
