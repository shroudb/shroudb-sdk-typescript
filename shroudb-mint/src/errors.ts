/**
 * ShroudbMint error types.
 *
 * Auto-generated from shroudb-mint protocol spec. Do not edit.
 */

export class ShroudbMintError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
  ) {
    super(`[${code}] ${detail}`);
    this.name = "ShroudbMintError";
  }

  /** @internal Construct the appropriate error subclass from a server error. */
  static _fromServer(code: string, detail: string): ShroudbMintError {
    const Factory = ERROR_MAP[code] ?? ShroudbMintError;
    return new Factory(code, detail);
  }
}

/** Missing or invalid argument */
export class BadargError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "BadargError";
  }
}

/** Authentication required or insufficient permissions */
export class DeniedError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeniedError";
  }
}

/** CA is disabled */
export class DisabledError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DisabledError";
  }
}

/** CA already exists */
export class ExistsError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "ExistsError";
  }
}

/** Unexpected server error */
export class InternalError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "InternalError";
  }
}

/** Signing key not available */
export class NokeyError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NokeyError";
  }
}

/** CA or certificate not found */
export class NotfoundError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotfoundError";
  }
}

/** Server is starting up or shutting down */
export class NotreadyError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotreadyError";
  }
}

/** Backend storage error */
export class StorageError extends ShroudbMintError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "StorageError";
  }
}

const ERROR_MAP: Record<string, typeof ShroudbMintError> = {
  "BADARG": BadargError,
  "DENIED": DeniedError,
  "DISABLED": DisabledError,
  "EXISTS": ExistsError,
  "INTERNAL": InternalError,
  "NOKEY": NokeyError,
  "NOTFOUND": NotfoundError,
  "NOTREADY": NotreadyError,
  "STORAGE": StorageError,
};
