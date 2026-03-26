/**
 * ShroudbTransit error types.
 *
 * Auto-generated from shroudb-transit protocol spec. Do not edit.
 */

export class ShroudbTransitError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
  ) {
    super(`[${code}] ${detail}`);
    this.name = "ShroudbTransitError";
  }

  /** @internal Construct the appropriate error subclass from a server error. */
  static _fromServer(code: string, detail: string): ShroudbTransitError {
    const Factory = ERROR_MAP[code] ?? ShroudbTransitError;
    return new Factory(code, detail);
  }
}

/** Missing or invalid argument */
export class BadargError extends ShroudbTransitError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "BadargError";
  }
}

/** Authentication required or insufficient permissions */
export class DeniedError extends ShroudbTransitError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeniedError";
  }
}

/** Keyring is disabled */
export class DisabledError extends ShroudbTransitError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DisabledError";
  }
}

/** Unexpected server error */
export class InternalError extends ShroudbTransitError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "InternalError";
  }
}

/** Keyring or key version not found */
export class NotfoundError extends ShroudbTransitError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotfoundError";
  }
}

/** Server is starting up or shutting down */
export class NotreadyError extends ShroudbTransitError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotreadyError";
  }
}

/** Operation not supported for this keyring type */
export class WrongtypeError extends ShroudbTransitError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "WrongtypeError";
  }
}

const ERROR_MAP: Record<string, typeof ShroudbTransitError> = {
  "BADARG": BadargError,
  "DENIED": DeniedError,
  "DISABLED": DisabledError,
  "INTERNAL": InternalError,
  "NOTFOUND": NotfoundError,
  "NOTREADY": NotreadyError,
  "WRONGTYPE": WrongtypeError,
};
