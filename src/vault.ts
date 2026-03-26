import { HttpTransport } from './transport';

export class VaultNamespace {
  constructor(
    private transport: HttpTransport,
    private prefix: string,
  ) {}

  /** AUTH — Authenticate the current connection */
  async auth(token: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${token}`, { verb: 'AUTH' });
  }

  /** CONFIG — Retrieve a runtime configuration value */
  async configGet(key: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${key}`, { verb: 'CONFIG' });
  }

  /** CONFIG — Set a runtime configuration value */
  async configSet(key: string, value: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${key}`, { verb: 'CONFIG', ...options });
  }

  /** HEALTH — Check server or keyspace health */
  async health(keyspace: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'HEALTH' });
  }

  /** INSPECT — Retrieve full details about a credential */
  async inspect(keyspace: string, credential_id: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'INSPECT', ...options });
  }

  /** ISSUE — Issue a new credential in the given keyspace */
  async issue(keyspace: string, options?: {
    claims?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    ttl_secs?: number;
    idempotency_key?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'ISSUE', ...options });
  }

  /** JWKS — Return the JSON Web Key Set for a JWT keyspace */
  async jwks(keyspace: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'JWKS' });
  }

  /** KEYS — List credential IDs with optional filtering and pagination */
  async keys(keyspace: string, options?: {
    cursor?: string;
    pattern?: string;
    state_filter?: string;
    count?: number;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'KEYS', ...options });
  }

  /** KEYSTATE — Show the current key ring state for a keyspace */
  async keystate(keyspace: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'KEYSTATE' });
  }

  /** PASSWORD — Change a user's password (requires old password) */
  async passwordChange(keyspace: string, user_id: string, old_password: string, new_password: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'PASSWORD', ...options });
  }

  /** PASSWORD — Import a pre-hashed password for migration from another system (argon2, bcrypt, scrypt) */
  async passwordImport(keyspace: string, user_id: string, hash: string, options?: {
    metadata?: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'PASSWORD', ...options });
  }

  /** PASSWORD — Set a password for a user in a password keyspace */
  async passwordSet(keyspace: string, user_id: string, password: string, options?: {
    metadata?: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'PASSWORD', ...options });
  }

  /** PASSWORD — Verify a user's password */
  async passwordVerify(keyspace: string, user_id: string, password: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'PASSWORD', ...options });
  }

  /** REFRESH — Exchange a refresh token for a new one */
  async refresh(keyspace: string, token: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'REFRESH', ...options });
  }

  /** REVOKE — Revoke a credential by ID */
  async revoke(keyspace: string, credential_id: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'REVOKE', ...options });
  }

  /** REVOKE — Bulk-revoke multiple credentials */
  async revokeBulk(keyspace: string, options?: {
    ids?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'REVOKE', ...options });
  }

  /** REVOKE — Revoke all credentials in a refresh token family */
  async revokeFamily(keyspace: string, options?: {
    family_id?: string;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'REVOKE', ...options });
  }

  /** ROTATE — Trigger signing key rotation for a keyspace */
  async rotate(keyspace: string, options?: {
    force?: boolean;
    nowait?: boolean;
    dryrun?: boolean;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'ROTATE', ...options });
  }

  /** SCHEMA — Display the metadata schema for a keyspace */
  async schema(keyspace: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'SCHEMA' });
  }

  /** SUBSCRIBE — Subscribe to real-time event notifications */
  async subscribe(channel: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${channel}`, { verb: 'SUBSCRIBE' });
  }

  /** SUSPEND — Temporarily suspend a credential */
  async suspend(keyspace: string, credential_id: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'SUSPEND', ...options });
  }

  /** UNSUSPEND — Reactivate a previously suspended credential */
  async unsuspend(keyspace: string, credential_id: string): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'UNSUSPEND', ...options });
  }

  /** UPDATE — Update metadata on an existing credential */
  async update(keyspace: string, credential_id: string, options?: {
    metadata?: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'UPDATE', ...options });
  }

  /** VERIFY — Verify a credential (JWT, API key, or HMAC signature) */
  async verify(keyspace: string, token: string, options?: {
    payload?: string;
    check_revoked?: boolean;
  }): Promise<Record<string, unknown>> {
    return this.transport.post(`${this.prefix}/${keyspace}`, { verb: 'VERIFY', ...options });
  }

}
