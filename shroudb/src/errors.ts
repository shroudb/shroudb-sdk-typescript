/**
 * Shroudb error types.
 *
 * Auto-generated from shroudb protocol spec. Do not edit.
 */

export class ShroudbError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
  ) {
    super(`[${code}] ${detail}`);
    this.name = "ShroudbError";
  }

  /** @internal Construct the appropriate error subclass from a server error. */
  static _fromServer(code: string, detail: string): ShroudbError {
    const Factory = ERROR_MAP[code] ?? ShroudbError;
    return new Factory(code, detail);
  }
}

/** Missing or malformed command argument */
export class BadargError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "BadargError";
  }
}

/** Refresh token chain limit exceeded */
export class ChainLimitError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "ChainLimitError";
  }
}

/** Cryptographic operation failed */
export class CryptoError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "CryptoError";
  }
}

/** Authentication required or insufficient permissions */
export class DeniedError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeniedError";
  }
}

/** Keyspace is disabled */
export class DisabledError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DisabledError";
  }
}

/** Credential has expired */
export class ExpiredError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "ExpiredError";
  }
}

/** Unexpected internal error */
export class InternalError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "InternalError";
  }
}

/** Account temporarily locked due to too many failed attempts */
export class LockedError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "LockedError";
  }
}

/** Credential, keyspace, or resource does not exist */
export class NotfoundError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotfoundError";
  }
}

/** Server is not ready (still starting up) */
export class NotreadyError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotreadyError";
  }
}

/** Refresh token reuse detected — family revoked */
export class ReuseDetectedError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "ReuseDetectedError";
  }
}

/** Credential is in wrong state for this operation */
export class StateErrorError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "StateErrorError";
  }
}

/** Storage engine error */
export class StorageError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "StorageError";
  }
}

/** Metadata or claims failed schema validation */
export class ValidationErrorError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "ValidationErrorError";
  }
}

/** Operation not supported for this keyspace type */
export class WrongtypeError extends ShroudbError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "WrongtypeError";
  }
}

const ERROR_MAP: Record<string, typeof ShroudbError> = {
  "BADARG": BadargError,
  "CHAIN_LIMIT": ChainLimitError,
  "CRYPTO": CryptoError,
  "DENIED": DeniedError,
  "DISABLED": DisabledError,
  "EXPIRED": ExpiredError,
  "INTERNAL": InternalError,
  "LOCKED": LockedError,
  "NOTFOUND": NotfoundError,
  "NOTREADY": NotreadyError,
  "REUSE_DETECTED": ReuseDetectedError,
  "STATE_ERROR": StateErrorError,
  "STORAGE": StorageError,
  "VALIDATION_ERROR": ValidationErrorError,
  "WRONGTYPE": WrongtypeError,
};
