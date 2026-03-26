// ShroudbAuth TypeScript client — auto-generated from API spec. Do not edit.

/** Response from the `change_password` endpoint. */
export interface ChangePasswordResponse {
  /** Always "OK" */
  status: string;
}

/** Response from the `forgot_password` endpoint. */
export interface ForgotPasswordResponse {
  /** Reset token TTL in seconds */
  expires_in?: number;
  /** Password reset token (only present if user exists) */
  reset_token?: string;
  /** Always "OK" */
  status: string;
}

/** Response from the `health` endpoint. */
export interface HealthResponse {
  /** "healthy" or "unhealthy" */
  status: string;
}

/** Response from the `jwks` endpoint. */
export interface JwksResponse {
  /** Array of JWK objects */
  keys: unknown[];
}

/** Response from the `login` endpoint. */
export interface LoginResponse {
  /** JWT access token */
  access_token: string;
  /** Access token TTL in seconds */
  expires_in: number;
  /** Opaque refresh token */
  refresh_token: string;
  /** Authenticated user's ID */
  user_id: string;
}

/** Response from the `logout` endpoint. */
export interface LogoutResponse {
  /** Always "OK" */
  status: string;
}

/** Response from the `logout_all` endpoint. */
export interface LogoutAllResponse {
  /** Number of refresh token families revoked */
  revoked_families: number;
  /** Always "OK" */
  status: string;
}

/** Response from the `refresh` endpoint. */
export interface RefreshResponse {
  /** New JWT access token */
  access_token: string;
  /** Access token TTL in seconds */
  expires_in: number;
  /** New opaque refresh token */
  refresh_token: string;
}

/** Response from the `reset_password` endpoint. */
export interface ResetPasswordResponse {
  /** Always "OK" */
  status: string;
}

/** Response from the `session` endpoint. */
export interface SessionResponse {
  /** JWT claims from the access token */
  claims: Record<string, unknown>;
  /** Token expiration as Unix timestamp */
  expires_at?: number;
  /** Authenticated user's ID */
  user_id?: string;
}

/** Response from the `sessions` endpoint. */
export interface SessionsResponse {
  /** Array of active session objects */
  active_sessions: unknown[];
  /** Authenticated user's ID */
  user_id: string;
}

/** Response from the `signup` endpoint. */
export interface SignupResponse {
  /** JWT access token */
  access_token: string;
  /** Access token TTL in seconds */
  expires_in: number;
  /** Opaque refresh token */
  refresh_token: string;
  /** The registered user's ID */
  user_id: string;
}

