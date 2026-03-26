/**
 * ShroudbSentry error types.
 *
 * Auto-generated from shroudb-sentry protocol spec. Do not edit.
 */

export class ShroudbSentryError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
  ) {
    super(`[${code}] ${detail}`);
    this.name = "ShroudbSentryError";
  }

  /** @internal Construct the appropriate error subclass from a server error. */
  static _fromServer(code: string, detail: string): ShroudbSentryError {
    const Factory = ERROR_MAP[code] ?? ShroudbSentryError;
    return new Factory(code, detail);
  }
}

/** Missing or invalid argument */
export class BadargError extends ShroudbSentryError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "BadargError";
  }
}

/** Authentication required or insufficient permissions */
export class DeniedError extends ShroudbSentryError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeniedError";
  }
}

/** Unexpected server error */
export class InternalError extends ShroudbSentryError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "InternalError";
  }
}

/** Signing key not available */
export class NokeyError extends ShroudbSentryError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NokeyError";
  }
}

/** Policy not found */
export class NotfoundError extends ShroudbSentryError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotfoundError";
  }
}

/** Server is starting up or shutting down */
export class NotreadyError extends ShroudbSentryError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotreadyError";
  }
}

const ERROR_MAP: Record<string, typeof ShroudbSentryError> = {
  "BADARG": BadargError,
  "DENIED": DeniedError,
  "INTERNAL": InternalError,
  "NOKEY": NokeyError,
  "NOTFOUND": NotfoundError,
  "NOTREADY": NotreadyError,
};
