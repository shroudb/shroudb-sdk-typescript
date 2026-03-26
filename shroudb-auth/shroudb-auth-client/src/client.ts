// ShroudbAuth TypeScript client — auto-generated from API spec. Do not edit.
import { ShroudbAuthError } from "./errors";
import type { ChangePasswordResponse, ForgotPasswordResponse, HealthResponse, JwksResponse, LoginResponse, LogoutResponse, LogoutAllResponse, RefreshResponse, ResetPasswordResponse, SessionResponse, SessionsResponse, SignupResponse } from "./types";

/** Optional parameters for `signup`. */
export interface SignupOptions {
  /** Optional user metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Authentication service
 *
 * Uses the Fetch API — works in browsers, Node 18+, Deno, and Bun.
 */
export class ShroudbAuthClient {
  private readonly baseUrl: string;
  private readonly keyspace: string;
  /** Request timeout in milliseconds. */
  private readonly timeout: number;
  /** Current access token, set automatically after auth calls. */
  public accessToken: string | undefined;
  /** Current refresh token, set automatically after auth calls. */
  public refreshToken: string | undefined;

  /**
   * Create a new ShroudbAuth client.
   * @param baseUrl  Base URL of the ShroudbAuth server (e.g. `http://localhost:4001`).
   * @param keyspace Optional keyspace. Defaults to `"default"`.
   * @param timeout  Request timeout in milliseconds. Defaults to `30000`.
   */
  constructor(baseUrl: string, keyspace?: string, timeout?: number) {
    // Strip trailing slash for consistent URL building
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.keyspace = keyspace ?? "default";
    this.timeout = timeout ?? 30_000;
  }

  /**
   * Change password for the currently authenticated user
   * @param newPassword New password
   * @param oldPassword Current password
   */
  async changePassword(newPassword: string, oldPassword: string): Promise<ChangePasswordResponse> {
    const body: Record<string, unknown> = {};
    body["new_password"] = newPassword;
    body["old_password"] = oldPassword;
    const result = await this.request("POST", `/auth/${this.keyspace}/change-password`, { body, auth: this.accessToken });
    return result as ChangePasswordResponse;
  }

  /**
   * Request a password reset token (always returns 200 to prevent enumeration)
   * @param userId User identifier
   */
  async forgotPassword(userId: string): Promise<ForgotPasswordResponse> {
    const body: Record<string, unknown> = {};
    body["user_id"] = userId;
    const result = await this.request("POST", `/auth/${this.keyspace}/forgot-password`, { body });
    return result as ForgotPasswordResponse;
  }

  /**
   * Health check endpoint
   */
  async health(): Promise<HealthResponse> {
    const result = await this.request("GET", `/auth/health`);
    return result as HealthResponse;
  }

  /**
   * Public JSON Web Key Set for verifying access tokens
   */
  async jwks(): Promise<JwksResponse> {
    const result = await this.request("GET", `/auth/${this.keyspace}/.well-known/jwks.json`);
    return result as JwksResponse;
  }

  /**
   * Authenticate a user and receive access + refresh tokens
   * @param password User password
   * @param userId User identifier
   */
  async login(password: string, userId: string): Promise<LoginResponse> {
    const body: Record<string, unknown> = {};
    body["password"] = password;
    body["user_id"] = userId;
    const result = await this.request("POST", `/auth/${this.keyspace}/login`, { body });
    this.accessToken = result.access_token as string;
    this.refreshToken = result.refresh_token as string;
    return result as LoginResponse;
  }

  /**
   * Revoke the current refresh token family and clear cookies
   */
  async logout(): Promise<LogoutResponse> {
    const result = await this.request("POST", `/auth/${this.keyspace}/logout`, { auth: this.refreshToken });
    return result as LogoutResponse;
  }

  /**
   * Revoke all refresh token families for a user
   * @param userId User whose sessions to revoke (must match authenticated user)
   */
  async logoutAll(userId: string): Promise<LogoutAllResponse> {
    const body: Record<string, unknown> = {};
    body["user_id"] = userId;
    const result = await this.request("POST", `/auth/${this.keyspace}/logout-all`, { body, auth: this.accessToken });
    return result as LogoutAllResponse;
  }

  /**
   * Exchange a refresh token for new access + refresh tokens
   */
  async refresh(): Promise<RefreshResponse> {
    const result = await this.request("POST", `/auth/${this.keyspace}/refresh`, { auth: this.refreshToken });
    this.accessToken = result.access_token as string;
    this.refreshToken = result.refresh_token as string;
    return result as RefreshResponse;
  }

  /**
   * Reset password using a single-use reset token (revoked after use)
   * @param newPassword New password
   * @param token Password reset token from forgot-password
   */
  async resetPassword(newPassword: string, token: string): Promise<ResetPasswordResponse> {
    const body: Record<string, unknown> = {};
    body["new_password"] = newPassword;
    body["token"] = token;
    const result = await this.request("POST", `/auth/${this.keyspace}/reset-password`, { body });
    return result as ResetPasswordResponse;
  }

  /**
   * Validate current session and return user info
   */
  async session(): Promise<SessionResponse> {
    const result = await this.request("GET", `/auth/${this.keyspace}/session`, { auth: this.accessToken });
    return result as SessionResponse;
  }

  /**
   * List active sessions (refresh token families) for the authenticated user
   */
  async sessions(): Promise<SessionsResponse> {
    const result = await this.request("GET", `/auth/${this.keyspace}/sessions`, { auth: this.accessToken });
    return result as SessionsResponse;
  }

  /**
   * Register a new user and receive access + refresh tokens
   * @param password User password
   * @param userId Unique user identifier
   * @param options Optional parameters.
   */
  async signup(password: string, userId: string, options?: SignupOptions): Promise<SignupResponse> {
    const body: Record<string, unknown> = {};
    body["password"] = password;
    body["user_id"] = userId;
    if (options?.metadata !== undefined) body["metadata"] = options.metadata;
    const result = await this.request("POST", `/auth/${this.keyspace}/signup`, { body });
    this.accessToken = result.access_token as string;
    this.refreshToken = result.refresh_token as string;
    return result as SignupResponse;
  }

  // ─── internal ───────────────────────────────────────────────────────

  private async request(
    method: string,
    path: string,
    opts?: { body?: Record<string, unknown>; auth?: string },
  ): Promise<Record<string, unknown>> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {};

    if (opts?.auth !== undefined && opts.auth !== "") {
      headers["Authorization"] = `Bearer ${opts.auth}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    const init: RequestInit = { method, headers, signal: controller.signal };
    if (opts?.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(opts.body);
    }

    let res: Response;
    try {
      res = await fetch(url, init);
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new ShroudbAuthError(
          "TIMEOUT",
          `Request timed out after ${this.timeout}ms`,
          undefined,
          undefined,
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }

    const text = await res.text();
    const truncate = (s: string, max: number) =>
      s.length > max ? s.slice(0, max) + "..." : s;
    let json: Record<string, unknown>;
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      throw new ShroudbAuthError(
        "PARSE_ERROR",
        `Server returned non-JSON response (HTTP ${res.status})`,
        truncate(text, 500),
        res.status,
      );
    }

    if (!res.ok) {
      throw ShroudbAuthError._fromResponse(json, res.status);
    }

    return json;
  }
}
