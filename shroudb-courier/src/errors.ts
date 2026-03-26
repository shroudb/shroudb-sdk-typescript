/**
 * ShroudbCourier error types.
 *
 * Auto-generated from shroudb-courier protocol spec. Do not edit.
 */

export class ShroudbCourierError extends Error {
  constructor(
    public readonly code: string,
    public readonly detail: string,
  ) {
    super(`[${code}] ${detail}`);
    this.name = "ShroudbCourierError";
  }

  /** @internal Construct the appropriate error subclass from a server error. */
  static _fromServer(code: string, detail: string): ShroudbCourierError {
    const Factory = ERROR_MAP[code] ?? ShroudbCourierError;
    return new Factory(code, detail);
  }
}

/** Missing or invalid argument */
export class BadargError extends ShroudbCourierError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "BadargError";
  }
}

/** Notification delivery failed */
export class DeliveryFailedError extends ShroudbCourierError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeliveryFailedError";
  }
}

/** Authentication required or insufficient permissions */
export class DeniedError extends ShroudbCourierError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "DeniedError";
  }
}

/** Unexpected server error */
export class InternalError extends ShroudbCourierError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "InternalError";
  }
}

/** Template not found */
export class NotfoundError extends ShroudbCourierError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotfoundError";
  }
}

/** Server is starting up or shutting down */
export class NotreadyError extends ShroudbCourierError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "NotreadyError";
  }
}

/** Template rendering error */
export class TemplateErrorError extends ShroudbCourierError {
  constructor(code: string, detail: string) {
    super(code, detail);
    this.name = "TemplateErrorError";
  }
}

const ERROR_MAP: Record<string, typeof ShroudbCourierError> = {
  "BADARG": BadargError,
  "DELIVERY_FAILED": DeliveryFailedError,
  "DENIED": DeniedError,
  "INTERNAL": InternalError,
  "NOTFOUND": NotfoundError,
  "NOTREADY": NotreadyError,
  "TEMPLATE_ERROR": TemplateErrorError,
};
