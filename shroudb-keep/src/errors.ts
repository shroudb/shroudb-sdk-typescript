/**
 * ShroudbKeep error types.
 *
 * Auto-generated from shroudb-keep protocol spec. Do not edit.
 */

export class ShroudbKeepError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
  ) {
    super(`[${code}] ${detail}`);
    this.name = "ShroudbKeepError";
  }

  /** @internal Construct the appropriate error subclass from a server error. */
  static _fromServer(code: string, detail: string): ShroudbKeepError {
    const Factory = ERROR_MAP[code] ?? ShroudbKeepError;
    return new Factory(code, detail);
  }
}

/** Missing or invalid argument */
export class BadargError extends ShroudbKeepError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "BadargError";
  }
}

/** Secret has been soft-deleted */
export class DeletedError extends ShroudbKeepError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeletedError";
  }
}

/** Authentication required or insufficient permissions */
export class DeniedError extends ShroudbKeepError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeniedError";
  }
}

/** Unexpected server error */
export class InternalError extends ShroudbKeepError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "InternalError";
  }
}

/** Secret path or version not found */
export class NotfoundError extends ShroudbKeepError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotfoundError";
  }
}

/** Server is starting up or shutting down */
export class NotreadyError extends ShroudbKeepError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotreadyError";
  }
}

/** Backend storage error */
export class StorageError extends ShroudbKeepError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "StorageError";
  }
}

const ERROR_MAP: Record<string, typeof ShroudbKeepError> = {
  "BADARG": BadargError,
  "DELETED": DeletedError,
  "DENIED": DeniedError,
  "INTERNAL": InternalError,
  "NOTFOUND": NotfoundError,
  "NOTREADY": NotreadyError,
  "STORAGE": StorageError,
};
