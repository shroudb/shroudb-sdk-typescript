# ShrouDB SDK — Agent Instructions

> Unified TypeScript SDK for all ShrouDB security engines. Provides namespaced, type-safe access with built-in serialization.

## Quick Context

- **Package**: `@shroudb/sdk`
- **Transport**: RESP3 (direct engine connections) or HTTP (Moat gateway)
- **Pattern**: `db.<engine>.<command>(params)` — all methods async, return typed responses
- **Serialization**: Handled internally — pass native JS types, get typed objects back

## Connection

```typescript
import { ShrouDB } from '@shroudb/sdk';

// Moat gateway (HTTP) — all engines through one endpoint
const db = new ShrouDB({ moat: 'https://moat.example.com', token: 'my-token' });

// Direct — only the engines you need
const db = new ShrouDB({ cipher: 'shroudb-cipher://token@host:6599' });

// Mixed — Moat default + direct overrides
const db = new ShrouDB({
  moat: 'https://moat.example.com',
  cipher: 'shroudb-cipher://token@dedicated:6599',
  token: 'moat-token',
});

// Always close when done
await db.close();
```

## `db.shroudb` — Encrypted key-value database

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ actor }` | Authenticate the connection with a token |
| `commandList` | `` | `{ commands, count }` | List all supported commands |
| `configGet` | `key` | `{ key, value }` | Read a runtime configuration value |
| `configSet` | `key, value` | `{}` | Set a runtime configuration value (admin only) |
| `delete` | `namespace, key` | `{ version }` | Delete a key by writing a tombstone |
| `get` | `namespace, key, META?, options?` | `{ key, metadata, value, version }` | Retrieve the value at a key |
| `health` | `` | `{ message }` | Check server health |
| `list` | `namespace, options?` | `{ cursor, keys }` | List active keys in a namespace |
| `namespaceAlter` | `name, options?` | `{}` | Update namespace configuration (enforce-on-write-only) |
| `namespaceCreate` | `name, options?` | `{}` | Create a new namespace |
| `namespaceDrop` | `name, FORCE?` | `{}` | Drop a namespace |
| `namespaceInfo` | `name` | `{ created_at, key_count, name }` | Get metadata about a namespace |
| `namespaceList` | `options?` | `{ cursor, namespaces }` | List namespaces (filtered by token grants) |
| `namespaceValidate` | `name` | `{ count, reports }` | Check existing entries against current MetaSchema |
| `ping` | `` | `{ message }` | Test connectivity |
| `pipeline` | `count` | `{}` | Execute commands atomically (all succeed or all roll back) |
| `put` | `namespace, key, value?, options?` | `{ version }` | Store a value at the given key. Auto-increments version. |
| `subscribe` | `namespace, options?` | `{}` | Subscribe to change events on a namespace |
| `unsubscribe` | `` | `{}` | End the current subscription |
| `versions` | `namespace, key, options?` | `{ versions }` | Retrieve version history for a key (most recent first) |

### Examples

```typescript
const { key, value } = await db.shroudb.configGet('key');
await db.shroudb.configSet('key', 'alice@example.com');
const { version } = await db.shroudb.delete('namespace', 'key');
```

## `db.cipher` — Encryption-as-a-service

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate the connection |
| `commandList` | `` | `{ count, commands }` | List all supported commands |
| `decrypt` | `keyring, ciphertext, options?` | `{ plaintext }` | Decrypt ciphertext using the embedded key version |
| `encrypt` | `keyring, plaintext, options?` | `{ ciphertext, key_version }` | Encrypt plaintext with the active key version |
| `generateDataKey` | `keyring, options?` | `{ plaintext_key, wrapped_key, key_version }` | Generate a data encryption key (envelope encryption pattern) |
| `health` | `` | `{ status }` | Check server health |
| `keyInfo` | `keyring` | `{ keyring, algorithm, active_version, versions }` | Get keyring metadata and key version information |
| `keyringCreate` | `name, algorithm, options?` | `{ keyring, algorithm, active_version }` | Create a new keyring with its first active key |
| `keyringList` | `` | `{ keyrings }` | List all keyring names |
| `ping` | `` | `{ message }` | Simple connectivity check — returns PONG |
| `rewrap` | `keyring, ciphertext, options?` | `{ ciphertext, key_version }` | Re-encrypt ciphertext with the current active key version |
| `rotate` | `keyring, options?` | `{ rotated, key_version, previous_version }` | Rotate the keyring to a new key version |
| `sign` | `keyring, data` | `{ signature, key_version }` | Create a detached signature |
| `verifySignature` | `keyring, data, signature` | `{ valid }` | Verify a detached signature |

### Examples

```typescript
const { plaintext } = await db.cipher.decrypt('my-keyring', 'k3Xm:encrypted...');
const { ciphertext, key_version } = await db.cipher.encrypt('my-keyring', 'SGVsbG8=');
const { plaintext_key, wrapped_key, key_version } = await db.cipher.generateDataKey('my-keyring');
```

## `db.sigil` — Schema-driven credential envelope engine

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `credentialChange` | `schema, id, field, old, new` | `{ status }` | Change a credential field (requires old value for verification) |
| `credentialImport` | `schema, id, field, hash, options?` | `{ algorithm }` | Import a pre-hashed credential (bcrypt, scrypt, argon2). Transparently rehashed to Argon2id on next verify. |
| `credentialReset` | `schema, id, field, new` | `{ status }` | Force-reset a credential field without requiring old value (admin/reset token) |
| `envelopeCreate` | `schema, id, json` | `{ created_at, fields, id }` | Create an envelope with field routing per schema annotations |
| `envelopeDelete` | `schema, id` | `{ status }` | Delete an envelope and all associated data |
| `envelopeGet` | `schema, id` | `{ created_at, fields, id, updated_at }` | Get an envelope record |
| `envelopeImport` | `schema, id, json` | `{ created_at, fields, id }` | Import an envelope with pre-hashed credential fields. Non-credential fields processed normally. |
| `envelopeLookup` | `schema, field, value` | `{ created_at, fields, id, updated_at }` | Look up an envelope by indexed or searchable field value |
| `envelopeUpdate` | `schema, id, json` | `{ fields, id, updated_at }` | Update non-credential fields on an existing envelope |
| `envelopeVerify` | `schema, id, field, value` | `{ valid }` | Verify a credential field on an envelope by explicit field name |
| `health` | `` | `{ status }` | Health check |
| `jwks` | `schema` | `{ keys }` | Get the JSON Web Key Set for external token verification |
| `passwordChange` | `schema, id, old, new` | `{ status }` | Sugar: change password. Infers credential field from schema. Equivalent to CREDENTIAL CHANGE with implicit field. |
| `passwordImport` | `schema, id, hash, options?` | `{ algorithm }` | Sugar: import pre-hashed password. Infers credential field from schema. Equivalent to CREDENTIAL IMPORT with implicit field. |
| `passwordReset` | `schema, id, new` | `{ status }` | Sugar: force-reset password. Infers credential field from schema. Equivalent to CREDENTIAL RESET with implicit field. |
| `schemaGet` | `name` | `{ schema }` | Get a schema definition by name |
| `schemaList` | `` | `{ names }` | List all registered schema names |
| `schemaRegister` | `name, json` | `{ version }` | Register a credential envelope schema |
| `sessionCreate` | `schema, id, password, options?` | `{ access_token, expires_in, refresh_token }` | Verify credentials and issue access + refresh tokens |
| `sessionList` | `schema, id` | `{ sessions }` | List active sessions for an entity |
| `sessionRefresh` | `schema, token` | `{ access_token, expires_in, refresh_token }` | Rotate refresh token and issue new access token |
| `sessionRevoke` | `schema, token` | `{ status }` | Revoke a single refresh token (logout one session) |
| `sessionRevokeAll` | `schema, id` | `{ revoked }` | Revoke all sessions for an entity (logout everywhere) |
| `userCreate` | `schema, id, json` | `{ created_at, fields, user_id }` | Sugar: create an envelope. Equivalent to ENVELOPE CREATE. |
| `userDelete` | `schema, id` | `{ status }` | Sugar: delete an envelope. Equivalent to ENVELOPE DELETE. |
| `userGet` | `schema, id` | `{ created_at, fields, updated_at, user_id }` | Sugar: get an envelope. Equivalent to ENVELOPE GET. |
| `userImport` | `schema, id, json` | `{ created_at, fields, user_id }` | Sugar: import an envelope with pre-hashed credentials. Equivalent to ENVELOPE IMPORT. |
| `userUpdate` | `schema, id, json` | `{ fields, updated_at, user_id }` | Sugar: update non-credential fields. Equivalent to ENVELOPE UPDATE. |
| `userVerify` | `schema, id, password` | `{ valid }` | Sugar: verify credential. Infers the credential field from schema. Equivalent to ENVELOPE VERIFY with implicit field. |

### Examples

```typescript
const { status } = await db.sigil.credentialChange('myapp', 'alice', 'email', 'old', 'new');
const { algorithm } = await db.sigil.credentialImport('myapp', 'alice', 'email', 'hash');
const { status } = await db.sigil.credentialReset('myapp', 'alice', 'email', 'new');
```

## `db.veil` — veil

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate this connection |
| `commandList` | `` | `{ count, commands }` | List all supported commands |
| `delete` | `index, id` | `{ status, id }` | Remove an entry's blind tokens from the index |
| `health` | `` | `{ status }` | Health check |
| `indexCreate` | `name` | `{ status, index, created_at }` | Create a new blind index with a fresh HMAC key |
| `indexInfo` | `name` | `{ index, created_at, entry_count }` | Get information about a blind index |
| `indexList` | `` | `{ items, type }` | List all blind index names |
| `ping` | `` | `{ type, value }` | Ping-pong |
| `put` | `index, id, plaintext_b64, options?` | `{ status, id, version }` | Tokenize plaintext and store the blind tokens under the given entry ID |
| `search` | `index, query, options?` | `{ status, scanned, matched, results }` | Search a blind index. Tokenizes the query, generates blind tokens, and compares against stored entries. |
| `tokenize` | `index, plaintext_b64, options?` | `{ status, words, trigrams, tokens }` | Generate blind tokens from plaintext without storing. Returns HMAC-derived tokens for external use. |

### Examples

```typescript
const { status, id } = await db.veil.delete('index', 'alice');
const { status, index, created_at } = await db.veil.indexCreate('my-keyring');
const { index, created_at, entry_count } = await db.veil.indexInfo('my-keyring');
```

## `db.sentry` — sentry

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate the connection with a token |
| `commandList` | `` | `{ commands, status }` | List all supported commands |
| `evaluate` | `json` | `{ cache_until, decision, matched_policy, status, token }` | Evaluate an authorization request against policies and return a signed decision |
| `health` | `` | `{ policy_count, status }` | Server health check |
| `jwks` | `` | `{ keys }` | Get the JSON Web Key Set for verifying decision tokens |
| `keyInfo` | `` | `{ active_kid, active_version, algorithm, decision_ttl_secs, drain_days, jwks_keys, rotation_days, status, total_versions }` | Get signing key metadata |
| `keyRotate` | `options?` | `{ key_version, previous_version, rotated, status }` | Rotate the signing key |
| `ping` | `` | `{}` | Connectivity check |
| `policyCreate` | `name, json` | `{ effect, name, priority, status }` | Create a new authorization policy |
| `policyDelete` | `name` | `{ status }` | Delete a policy |
| `policyGet` | `name` | `{ created_at, description, effect, name, priority, status, updated_at }` | Get a policy by name |
| `policyList` | `` | `{ count, policies, status }` | List all policy names |
| `policyUpdate` | `name, json` | `{ effect, name, priority, status, updated_at }` | Update an existing policy |

### Examples

```typescript
const { cache_until, decision, matched_policy, status, token } = await db.sentry.evaluate('json');
const { effect, name, priority, status } = await db.sentry.policyCreate('name', 'json');
const { status } = await db.sentry.policyDelete('name');
```

## `db.forge` — Internal certificate authority engine

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `caCreate` | `name, algorithm, subject, options?` | `{ active_version, algorithm, name, subject }` | Create a new Certificate Authority |
| `caExport` | `name` | `{ certificate_pem }` | Export the active CA certificate (PEM) |
| `caInfo` | `name` | `{ algorithm, key_versions, name, subject }` | Get CA metadata and key version status |
| `caList` | `` | `{ cas }` | List all Certificate Authorities |
| `caRotate` | `name, options?` | `{ key_version, previous_version, rotated }` | Rotate CA signing key |
| `inspect` | `ca, serial` | `{ certificate_pem, serial, state, subject }` | Get certificate details |
| `issue` | `ca, subject, profile, options?` | `{ certificate_pem, private_key_pem, serial }` | Issue a new certificate. Returns cert + private key (private key never stored). |
| `issueFromCsr` | `ca, csr_pem, profile, options?` | `{ certificate_pem, serial }` | Issue a certificate from a PEM-encoded CSR |
| `listCerts` | `ca, options?` | `{ certs, count }` | List certificates for a CA |
| `renew` | `ca, serial, options?` | `{ certificate_pem, private_key_pem, serial }` | Renew a certificate (re-issue with same profile and SANs) |
| `revoke` | `ca, serial, options?` | `{ status }` | Revoke a certificate |

### Examples

```typescript
const { active_version, algorithm, name, subject } = await db.forge.caCreate('name', 'algorithm', 'subject');
const { certificate_pem } = await db.forge.caExport('name');
const { algorithm, key_versions, name, subject } = await db.forge.caInfo('name');
```

## `db.keep` — Secrets manager with path-based access control and versioning

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate this connection with a token. |
| `commandList` | `` | `{ count, commands }` | List all supported commands. |
| `delete` | `path` | `{ status, path, deleted_at }` | Soft-delete a secret. Version history is preserved. |
| `get` | `path, options?` | `{ status, path, version, value, created_at, created_by }` | Retrieve a secret value. Returns the latest version by default. |
| `health` | `` | `{ status }` | Health check. |
| `list` | `prefix?` | `{ status, count, paths }` | List secret paths, optionally filtered by prefix. Excludes deleted secrets. |
| `ping` | `` | `{}` | Ping-pong. |
| `put` | `path, value` | `{ status, path, version }` | Store a new version of a secret. Creates the secret if it doesn't exist. Undeletes if soft-deleted. |
| `rotate` | `path` | `{ status, path, version }` | Re-encrypt the latest version with a new nonce. Creates a new version with the same plaintext. |
| `versions` | `path` | `{ status, path, version_count, versions, deleted }` | Get version history for a secret. Includes deleted secrets. |

### Examples

```typescript
const { status, path, deleted_at } = await db.keep.delete('path');
const { status, path, version, value, created_at, created_by } = await db.keep.get('path');
const { status, count, paths } = await db.keep.list('prefix');
```

## `db.courier` — Just-in-time decryption delivery engine

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate the connection with a token |
| `channelCreate` | `name, type, config_json` | `{ channel_type, name, status }` | Create a delivery channel |
| `channelDelete` | `name` | `{ name, status }` | Delete a channel |
| `channelGet` | `name` | `{ channel_type, created_at, enabled, name }` | Get channel configuration |
| `channelList` | `` | `{ channels, count, status }` | List all channels |
| `commandList` | `` | `{ commands, count }` | List available commands |
| `deliver` | `json` | `{ channel, delivered_at, delivery_id, status }` | Decrypt recipient and deliver a message |
| `health` | `` | `{ channels, status }` | Server health check |
| `ping` | `` | `{}` | Connectivity check |

### Examples

```typescript
const { channel_type, name, status } = await db.courier.channelCreate('name', 'type', 'config_json');
const { name, status } = await db.courier.channelDelete('name');
const { channel_type, created_at, enabled, name } = await db.courier.channelGet('name');
```

## `db.chronicle` — Structured audit event engine

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `actors` | `options?` | `{ entries }` | Active actors in time window |
| `auth` | `token` | `{ status }` | Authenticate this connection |
| `count` | `options?` | `{ count }` | Count events matching filter predicates |
| `errors` | `options?` | `{ entries }` | Error rates by action |
| `health` | `` | `{ status }` | Health check |
| `hotspots` | `options?` | `{ entries }` | Top actors by event volume |
| `ingest` | `event_json` | `{ status }` | Ingest a single structured audit event |
| `ingestBatch` | `events_json` | `{ ingested, status }` | Ingest multiple events in a single call |
| `ping` | `` | `{}` | Keepalive |
| `query` | `options?` | `{ events }` | Query events with filter predicates |

### Examples

```typescript
const { status } = await db.chronicle.ingest({ /* fields */ });
const { ingested, status } = await db.chronicle.ingestBatch({ /* fields */ });
```

## Error Handling

All methods throw `ShrouDBError` on failure. The `code` property matches the server error code (e.g., `NOTFOUND`, `DENIED`, `BADARG`).

```typescript
import { ShrouDBError, ErrorCode } from '@shroudb/sdk';

try {
  await db.cipher.encrypt('kr', data);
} catch (err) {
  if (err instanceof ShrouDBError) {
    console.error(err.code, err.message);
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `BAD_ARG` | Missing or malformed command argument |
| `DENIED` | Authentication required or insufficient permissions |
| `NAMESPACE_EXISTS` | Namespace already exists |
| `NAMESPACE_NOT_EMPTY` | Namespace is not empty (use FORCE to override) |
| `NAMESPACE_NOT_FOUND` | Namespace does not exist |
| `NOT_AUTHENTICATED` | No auth token provided on this connection |
| `NOT_FOUND` | Key or resource does not exist |
| `NOT_READY` | Server is not in READY state |
| `PIPELINE_ABORTED` | Pipeline command failed, all commands rolled back |
| `VALIDATION_FAILED` | Metadata validation failed against namespace schema |
| `VERSION_NOT_FOUND` | Requested version does not exist |
| `BADARG` | Missing or invalid argument |
| `DISABLED` | Keyring is disabled |
| `EXISTS` | Keyring already exists |
| `INTERNAL` | Unexpected server error |
| `NOTFOUND` | Keyring or key version not found |
| `POLICY` | Operation denied by keyring policy |
| `RETIRED` | Key version is retired — use REWRAP |
| `WRONGTYPE` | Operation not supported for this keyring type |
| `ACCOUNT_LOCKED` | Account locked after too many failed attempts |
| `CAPABILITY_MISSING` | Required engine capability not available (e.g., Cipher for PII fields) |
| `ENTITY_EXISTS` | Entity already exists |
| `ENTITY_NOT_FOUND` | Entity does not exist |
| `IMPORT_FAILED` | Password import failed (invalid hash format) |
| `INVALID_FIELD` | Field value is invalid or field cannot be updated via this path |
| `INVALID_TOKEN` | Token is invalid, expired, or revoked |
| `MISSING_FIELD` | Required field missing from request |
| `SCHEMA_EXISTS` | Schema already exists |
| `SCHEMA_NOT_FOUND` | Schema does not exist |
| `SCHEMA_VALIDATION` | Schema definition is invalid |
| `TOKEN_REUSE` | Refresh token reuse detected — entire family revoked |
| `VERIFICATION_FAILED` | Credential verification failed (wrong password) |
| `AUTH_REQUIRED` | Authentication required |
| `NOKEY` | No active signing key available |
| `SIGNING` | Failed to sign decision |
| `STORAGE` | Backend storage error |
| `DELETED` | Secret has been soft-deleted |
| `ENCRYPTION` | Encryption or decryption failed |
| `VERSION_NOTFOUND` | Requested version does not exist |
| `ADAPTER` | Delivery adapter failure |
| `DECRYPT` | Cipher decryption failed |

## Common Mistakes

- Always `await db.close()` to release connection pool resources
- Engine methods handle serialization — pass JS objects for JSON params, not `JSON.stringify()`
- Accessing an engine without a configured URI throws immediately — check your `ShrouDBOptions`
- Boolean keyword params (like `convergent`, `force`) are flags — `true` sends the keyword, `false`/`undefined` omits it
