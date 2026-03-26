// ShroudbAuth TypeScript client — auto-generated from API spec. Do not edit.

/**
 * Base error thrown by the ShroudbAuth client.
 */
export class ShroudbAuthError extends Error {
  /** Machine-readable error code. */
  public readonly code: string;
  /** Optional human-readable detail from the server. */
  public readonly detail: string | undefined;
  /** HTTP status code, if available. */
  public readonly status: number | undefined;

  constructor(code: string, message: string, detail?: string, status?: number) {
    super(message);
    this.name = "ShroudbAuthError";
    this.code = code;
    this.detail = detail;
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Construct the appropriate error subclass from an error response body.
   * @internal
   */
  static _fromResponse(body: Record<string, unknown>, status: number): ShroudbAuthError {
    const code = (body.code as string) ?? "UNKNOWN";
    const message = (body.message as string) ?? (body.error as string) ?? "Unknown error";
    const detail = body.detail as string | undefined;
    switch (code) {
      case "BAD_REQUEST": return new BadRequestError(message, detail, status);
      case "CONFLICT": return new ConflictError(message, detail, status);
      case "FORBIDDEN": return new ForbiddenError(message, detail, status);
      case "INTERNAL": return new InternalError(message, detail, status);
      case "TOO_MANY_REQUESTS": return new TooManyRequestsError(message, detail, status);
      case "UNAUTHORIZED": return new UnauthorizedError(message, detail, status);
      default: return new ShroudbAuthError(code, message, detail, status);
    }
  }
}

/** Invalid request body or parameters */
export class BadRequestError extends ShroudbAuthError {
  constructor(message: string, detail?: string, status?: number) {
    super("BAD_REQUEST", message, detail, status);
    this.name = "BadRequestError";
  }
}

/** Resource already exists (e.g. duplicate signup) */
export class ConflictError extends ShroudbAuthError {
  constructor(message: string, detail?: string, status?: number) {
    super("CONFLICT", message, detail, status);
    this.name = "ConflictError";
  }
}

/** Insufficient permissions */
export class ForbiddenError extends ShroudbAuthError {
  constructor(message: string, detail?: string, status?: number) {
    super("FORBIDDEN", message, detail, status);
    this.name = "ForbiddenError";
  }
}

/** Internal server error */
export class InternalError extends ShroudbAuthError {
  constructor(message: string, detail?: string, status?: number) {
    super("INTERNAL", message, detail, status);
    this.name = "InternalError";
  }
}

/** Account locked due to too many failed attempts */
export class TooManyRequestsError extends ShroudbAuthError {
  constructor(message: string, detail?: string, status?: number) {
    super("TOO_MANY_REQUESTS", message, detail, status);
    this.name = "TooManyRequestsError";
  }
}

/** Authentication required or invalid credentials */
export class UnauthorizedError extends ShroudbAuthError {
  constructor(message: string, detail?: string, status?: number) {
    super("UNAUTHORIZED", message, detail, status);
    this.name = "UnauthorizedError";
  }
}
