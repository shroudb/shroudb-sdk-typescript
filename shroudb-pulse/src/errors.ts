/**
 * ShroudbPulse error types.
 *
 * Auto-generated from shroudb-pulse protocol spec. Do not edit.
 */

export class ShroudbPulseError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
  ) {
    super(`[${code}] ${detail}`);
    this.name = "ShroudbPulseError";
  }

  /** @internal Construct the appropriate error subclass from a server error. */
  static _fromServer(code: string, detail: string): ShroudbPulseError {
    const Factory = ERROR_MAP[code] ?? ShroudbPulseError;
    return new Factory(code, detail);
  }
}

/** Missing or invalid argument */
export class BadargError extends ShroudbPulseError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "BadargError";
  }
}

/** Authentication required or insufficient permissions */
export class DeniedError extends ShroudbPulseError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeniedError";
  }
}

/** Unexpected server error */
export class InternalError extends ShroudbPulseError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "InternalError";
  }
}

/** Resource not found */
export class NotfoundError extends ShroudbPulseError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotfoundError";
  }
}

/** Server is starting up or shutting down */
export class NotreadyError extends ShroudbPulseError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotreadyError";
  }
}

/** Backend storage or WAL error */
export class StorageError extends ShroudbPulseError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "StorageError";
  }
}

const ERROR_MAP: Record<string, typeof ShroudbPulseError> = {
  "BADARG": BadargError,
  "DENIED": DeniedError,
  "INTERNAL": InternalError,
  "NOTFOUND": NotfoundError,
  "NOTREADY": NotreadyError,
  "STORAGE": StorageError,
};
