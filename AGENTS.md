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
| `configGet` | `key` | `{ key, source, value }` | Read a runtime configuration value |
| `configSet` | `key, value` | `{}` | Set a runtime configuration value (admin only). Only registered config keys are accepted; unknown keys return an error. Values are type-checked against the key's schema (u64, bool, string). Valid keys: max_segment_bytes, max_segment_entries, snapshot_entry_threshold, snapshot_time_threshold_secs. |
| `delete` | `namespace, key` | `{ version }` | Delete a key by writing a tombstone |
| `get` | `namespace, key, META?, options?` | `{ key, metadata, value, version }` | Retrieve the value at a key |
| `health` | `` | `{ message }` | Check server health |
| `list` | `namespace, options?` | `{ cursor, keys }` | List active keys in a namespace. Returns an error if the CURSOR value does not correspond to a key that exists in the namespace. |
| `namespaceAlter` | `name, options?` | `{}` | Update namespace configuration (enforce-on-write-only) |
| `namespaceCreate` | `name, options?` | `{}` | Create a new namespace |
| `namespaceDrop` | `name, FORCE?` | `{}` | Drop a namespace |
| `namespaceInfo` | `name` | `{ created_at, key_count, name }` | Get metadata about a namespace |
| `namespaceList` | `options?` | `{ cursor, namespaces }` | List namespaces (filtered by token grants) |
| `namespaceValidate` | `name` | `{ count, reports }` | Check existing entries against current MetaSchema |
| `ping` | `` | `{ message }` | Test connectivity |
| `pipeline` | `count` | `{}` | Execute commands atomically (all succeed or all roll back) |
| `put` | `namespace, key, value?, options?` | `{ version }` | Store a value at the given key. Auto-increments version. |
| `rekey` | `` | `{ message }` | Begin online rekey (zero-downtime master key rotation) |
| `rekeyStatus` | `` | `{ in_progress, progress, segments_completed, started_at, total_segments }` | Query progress of an in-flight rekey operation |
| `subscribe` | `namespace, options?` | `{}` | Subscribe to change events on a namespace |
| `unsubscribe` | `` | `{}` | End the current subscription |
| `versions` | `namespace, key, options?` | `{ versions }` | Retrieve version history for a key (most recent first) |

### Examples

```typescript
const { key, source, value } = await db.shroudb.configGet('key');
await db.shroudb.configSet('key', 'alice@example.com');
const { version } = await db.shroudb.delete('namespace', 'key');
```

## `db.cipher` — Encryption-as-a-service

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate the connection |
| `commandList` | `` | `{ count, commands }` | List all supported commands |
| `decrypt` | `keyring, ciphertext, options?` | `{ status, plaintext }` | Decrypt ciphertext using the embedded key version |
| `encrypt` | `keyring, plaintext, options?` | `{ status, ciphertext, key_version }` | Encrypt plaintext with the active key version |
| `generateDataKey` | `keyring, options?` | `{ status, plaintext_key, wrapped_key, key_version }` | Generate a data encryption key (envelope encryption pattern) |
| `health` | `` | `{ status }` | Check server health |
| `hello` | `` | `{ engine, version, protocol, commands, capabilities }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `keyInfo` | `keyring` | `{ keyring, algorithm, active_version, versions }` | Get keyring metadata and key version information |
| `keyringCreate` | `name, algorithm, options?` | `{ status, keyring, algorithm, active_version }` | Create a new keyring with its first active key |
| `keyringList` | `` | `{ keyrings }` | List all keyring names |
| `ping` | `` | `{ pong }` | Simple connectivity check — returns PONG |
| `rewrap` | `keyring, ciphertext, options?` | `{ status, ciphertext, key_version }` | Re-encrypt ciphertext with the current active key version |
| `rotate` | `keyring, options?` | `{ status, rotated, key_version, previous_version }` | Rotate the keyring to a new key version |
| `sign` | `keyring, data` | `{ status, signature, key_version }` | Create a detached signature |
| `verifySignature` | `keyring, data, signature` | `{ status, valid }` | Verify a detached signature |

### Examples

```typescript
const { status, plaintext } = await db.cipher.decrypt('my-keyring', 'k3Xm:encrypted...');
const { status, ciphertext, key_version } = await db.cipher.encrypt('my-keyring', 'SGVsbG8=');
const { status, plaintext_key, wrapped_key, key_version } = await db.cipher.generateDataKey('my-keyring');
```

## `db.sigil` — Schema-driven credential envelope engine

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate the current TCP connection with a bearer token. Handled at the connection layer, not dispatched to the engine. HTTP transport uses the Authorization: Bearer header instead. |
| `credentialChange` | `schema, id, field, old, new` | `{ status }` | Change a credential field (requires old value for verification) |
| `credentialImport` | `schema, id, field, hash, options?` | `{ algorithm, status }` | Import a pre-hashed credential (bcrypt, scrypt, argon2). Transparently rehashed to Argon2id on next verify. |
| `credentialReset` | `schema, id, field, new` | `{ status }` | Force-reset a credential field without requiring old value (admin/reset token) |
| `envelopeCreate` | `schema, id, json` | `{ created_at, entity_id, fields, status }` | Create an envelope with field routing per schema kind |
| `envelopeDelete` | `schema, id` | `{ status }` | Delete an envelope and all associated data |
| `envelopeGet` | `schema, id` | `{ created_at, entity_id, fields, updated_at }` | Get an envelope record |
| `envelopeImport` | `schema, id, json` | `{ created_at, entity_id, fields, status }` | Import an envelope with pre-hashed credential fields. Non-credential fields processed normally. |
| `envelopeLookup` | `schema, field, value` | `{ entity_id, status }` | Look up an envelope by indexed or searchable field value. Returns the matched entity ID only. |
| `envelopeUpdate` | `schema, id, json` | `{ entity_id, fields, status, updated_at }` | Update non-credential fields on an existing envelope |
| `envelopeVerify` | `schema, id, field, value` | `{ status, valid }` | Verify a credential field on an envelope by explicit field name |
| `health` | `` | `{ status }` | Health check |
| `hello` | `` | `{ capabilities, commands, engine, protocol, version }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `jwks` | `schema` | `{}` | Get the JSON Web Key Set for external token verification |
| `passwordChange` | `schema, id, old, new` | `{ status }` | Sugar: change password. Infers credential field from schema. Equivalent to CREDENTIAL CHANGE with implicit field. |
| `passwordImport` | `schema, id, hash, options?` | `{ algorithm, status }` | Sugar: import pre-hashed password. Infers credential field from schema. Equivalent to CREDENTIAL IMPORT with implicit field. |
| `passwordReset` | `schema, id, new` | `{ status }` | Sugar: force-reset password. Infers credential field from schema. Equivalent to CREDENTIAL RESET with implicit field. |
| `ping` | `` | `{ status }` | Ping-pong connectivity test |
| `schemaAlter` | `name, action, options?` | `{ fields, name, status, version }` | Add or remove fields from a schema, producing a new version. Added fields are optional (required=false). Existing envelopes remain readable. |
| `schemaGet` | `name` | `{}` | Get a schema definition by name |
| `schemaList` | `` | `{}` | List all registered schema names |
| `schemaRegister` | `name, json` | `{ status, version }` | Register a credential envelope schema |
| `sessionCreate` | `schema, id, password, options?` | `{ access_token, expires_in, refresh_token, status }` | Verify credentials and issue access + refresh tokens. Fields annotated with claim=true are auto-included in the JWT from the entity's envelope. Enriched claim values override caller-provided META for the same key. |
| `sessionList` | `schema, id` | `{}` | List active sessions for an entity |
| `sessionLogin` | `schema, field, value, password, options?` | `{ access_token, expires_in, refresh_token, status }` | Verify credentials by indexed field value (e.g., email) and issue access + refresh tokens. Same claim enrichment as SESSION CREATE. |
| `sessionRefresh` | `schema, token` | `{ access_token, expires_in, refresh_token, status }` | Rotate refresh token and issue new access token. Fields annotated with claim=true are re-read from the entity's current envelope, so refreshed tokens reflect the latest values (e.g. role changes). |
| `sessionRevoke` | `schema, token` | `{ status }` | Revoke a single refresh token (logout one session) |
| `sessionRevokeAll` | `schema, id` | `{ revoked, status }` | Revoke all sessions for an entity (logout everywhere) |
| `userCreate` | `schema, id, json` | `{ created_at, entity_id, fields, status }` | Sugar: create an envelope. Equivalent to ENVELOPE CREATE. |
| `userDelete` | `schema, id` | `{ status }` | Sugar: delete an envelope. Equivalent to ENVELOPE DELETE. |
| `userGet` | `schema, id` | `{ created_at, entity_id, fields, updated_at }` | Sugar: get an envelope. Equivalent to ENVELOPE GET. |
| `userImport` | `schema, id, json` | `{ created_at, entity_id, fields, status }` | Sugar: import an envelope with pre-hashed credentials. Equivalent to ENVELOPE IMPORT. |
| `userLookup` | `schema, field, value` | `{ entity_id, status }` | Sugar: look up by indexed or searchable field value. Equivalent to ENVELOPE LOOKUP. |
| `userUpdate` | `schema, id, json` | `{ entity_id, fields, status, updated_at }` | Sugar: update non-credential fields. Equivalent to ENVELOPE UPDATE. |
| `userVerify` | `schema, id, password` | `{ status, valid }` | Sugar: verify credential. Infers the credential field from schema. Equivalent to ENVELOPE VERIFY with implicit field. |

### Examples

```typescript
const { status } = await db.sigil.credentialChange('myapp', 'alice', 'email', 'old', 'new');
const { algorithm, status } = await db.sigil.credentialImport('myapp', 'alice', 'email', 'hash');
const { status } = await db.sigil.credentialReset('myapp', 'alice', 'email', 'new');
```

## `db.veil` — Searchable encryption with blind indexing

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate this connection |
| `commandList` | `` | `{ count, commands }` | List all supported commands |
| `delete` | `index, id` | `{ status, id }` | Remove an entry's blind tokens from the index |
| `health` | `` | `{ status }` | Health check |
| `hello` | `` | `{ engine, version, protocol, commands, capabilities }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `indexCreate` | `name` | `{ status, index, created_at, tokenizer_version }` | Create a new blind index with a fresh HMAC key |
| `indexDestroy` | `name` | `{ status, index, deleted_entries }` | Crypto-shred an index: zeroize the HMAC key, delete all entries, and remove the index. After destruction, the index name can be reused. |
| `indexInfo` | `name` | `{ index, created_at, entry_count, tokenizer_version }` | Get information about a blind index |
| `indexList` | `` | `{ items, type }` | List all blind index names |
| `indexReconcile` | `name, valid_ids` | `{ status, index, orphans_removed }` | Remove orphaned entries from the index. Compares stored entry IDs against the provided valid set and deletes any entries not in the set. |
| `indexReindex` | `name` | `{ status, index, tokenizer_version, entries_cleared }` | Clear all entries and update the tokenizer version to current. The HMAC key is preserved. After reindex, the application must re-submit all entries via PUT. Use this when the tokenizer algorithm has been upgraded. |
| `indexRotate` | `name` | `{ status, index, rotated_at, entry_count }` | Rotate an index's HMAC key. Generates a new key, deletes all existing entries. The application must re-index all entries after rotation. |
| `ping` | `` | `{ type, value }` | Ping-pong |
| `put` | `index, id, data_b64, options?` | `{ status, id, version }` | Store blind tokens for an entry. In standard mode, data_b64 is base64-encoded plaintext (server tokenizes). With BLIND flag, data_b64 is base64-encoded BlindTokenSet JSON (client pre-tokenized, for E2EE). |
| `search` | `index, query, options?` | `{ status, scanned, matched, results }` | Search a blind index. In standard mode, query is plain text (server tokenizes). With BLIND flag, query is base64-encoded BlindTokenSet JSON (client pre-tokenized, for E2EE). |
| `tokenize` | `index, plaintext_b64, options?` | `{ status, words, trigrams, tokens }` | Generate blind tokens from plaintext without storing. Returns HMAC-derived tokens for external use. |

### Examples

```typescript
const { status, id } = await db.veil.delete('index', 'alice');
const { status, index, created_at, tokenizer_version } = await db.veil.indexCreate('my-keyring');
const { status, index, deleted_entries } = await db.veil.indexDestroy('my-keyring');
```

## `db.sentry` — Policy-based authorization engine

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate the connection with a token |
| `commandList` | `` | `{ commands, status }` | List all supported commands |
| `evaluate` | `json` | `{ cache_until, decision, matched_policy, status, token }` | Evaluate an authorization request against policies and return a signed decision |
| `health` | `` | `{ policy_count, status }` | Server health check |
| `hello` | `` | `{ capabilities, commands, engine, protocol, version }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `jwks` | `` | `{ keys }` | Get the JSON Web Key Set for verifying decision tokens |
| `keyInfo` | `` | `{ active_kid, active_version, algorithm, decision_ttl_secs, drain_days, jwks_keys, rotation_days, status, total_versions }` | Get signing key metadata |
| `keyRotate` | `options?` | `{ key_version, previous_version, rotated, status }` | Rotate the signing key |
| `ping` | `` | `{}` | Connectivity check |
| `policyCreate` | `name, json` | `{ effect, name, priority, status, version }` | Create a new authorization policy |
| `policyDelete` | `name` | `{ status }` | Delete a policy |
| `policyGet` | `name` | `{ action, conditions, created_at, description, effect, name, principal, priority, resource, status, updated_at, version }` | Get a policy by name |
| `policyHistory` | `name` | `{ count, name, status, versions }` | Get version history of a policy (all past versions plus current) |
| `policyList` | `` | `{ count, policies, status }` | List all policy names |
| `policyUpdate` | `name, json` | `{ effect, name, priority, status, updated_at, version }` | Update an existing policy |

### Examples

```typescript
const { cache_until, decision, matched_policy, status, token } = await db.sentry.evaluate('json');
const { effect, name, priority, status, version } = await db.sentry.policyCreate('name', 'json');
const { status } = await db.sentry.policyDelete('name');
```

## `db.forge` — Internal certificate authority engine

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{ status }` | Authenticate this connection with a token |
| `caCreate` | `name, algorithm, subject, options?` | `{ active_version, algorithm, name, subject }` | Create a new Certificate Authority |
| `caExport` | `name` | `{ certificate_pem }` | Export the active CA certificate (PEM) |
| `caInfo` | `name` | `{ algorithm, key_versions, name, subject }` | Get CA metadata and key version status |
| `caList` | `` | `{ cas }` | List all Certificate Authorities |
| `caRotate` | `name, options?` | `{ key_version, previous_version, rotated }` | Rotate CA signing key |
| `command` | `` | `{ commands }` | List supported commands |
| `configGet` | `key` | `{ key, status, value }` | Get a runtime configuration value |
| `configSet` | `key, value` | `{ key, status, value }` | Set a runtime configuration value (only scheduler_interval_secs is mutable) |
| `health` | `` | `{ status }` | Health check |
| `hello` | `` | `{ capabilities, commands, engine, protocol, version }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `inspect` | `ca, serial` | `{ certificate_pem, serial, state, subject }` | Get certificate details |
| `issue` | `ca, subject, profile, options?` | `{ certificate_pem, private_key_pem, serial }` | Issue a new certificate. Returns cert + private key (private key never stored). |
| `issueFromCsr` | `ca, csr_pem, profile, options?` | `{ certificate_pem, serial }` | Issue a certificate from a PEM-encoded CSR |
| `listCerts` | `ca, options?` | `{ certs, count }` | List certificates for a CA |
| `ping` | `` | `{ status }` | Liveness probe. Returns PONG. |
| `regenerateCrl` | `ca` | `{ status }` | Force regeneration of the CRL for a CA. Also accepted as `CA REGENERATE_CRL <name>`. |
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
| `hello` | `` | `{ engine, version, protocol, commands, capabilities }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `list` | `prefix?` | `{ status, count, paths }` | List secret paths, optionally filtered by prefix. Excludes deleted secrets. |
| `ping` | `` | `{}` | Ping-pong. |
| `purge` | `path` | `{ status, path, purged_at }` | Permanently remove a secret and all its versions. Irreversible — used for GDPR right-to-erasure compliance. After purge, GET returns not-found (not deleted). |
| `put` | `path, value` | `{ status, path, version }` | Store a new version of a secret. Creates the secret if it doesn't exist. Undeletes if soft-deleted. |
| `rekey` | `new_key` | `{ status, rekeyed_secrets, rekeyed_versions }` | Re-encrypt all secrets with a new master key. Iterates all secrets (including deleted ones), decrypts every version with the current master key, re-encrypts with the new key, and switches to the new key for all future operations. |
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
| `deliveryGet` | `id` | `{ channel, delivered_at, delivery_id, error, status }` | Get a delivery receipt by ID |
| `deliveryList` | `options?` | `{ count, receipts, status }` | List delivery receipts, optionally filtered by channel |
| `health` | `` | `{ channels, status }` | Server health check |
| `hello` | `` | `{ capabilities, commands, engine, protocol, version }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `metrics` | `` | `{ delivered, failed, per_channel, total_deliveries }` | Get delivery metrics (total, success, failure counts, per-channel breakdown) |
| `notifyEvent` | `channel, subject, body` | `{ channel, delivered_at, delivery_id, status }` | Trigger a notification on a pre-configured channel (e.g. rotation/expiry alerts) |
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
| `actors` | `options?` | `{ actors, status }` | Top 20 actors by event count in the given time window |
| `auth` | `token` | `{ status }` | Authenticate this connection |
| `commandList` | `` | `{ commands }` | List available commands |
| `count` | `options?` | `{ count, scanned, status }` | Count events matching filter predicates |
| `errors` | `options?` | `{ errors, status }` | Operations ranked by error rate in the given time window |
| `health` | `` | `{ events, status }` | Health check |
| `hello` | `` | `{ capabilities, commands, engine, protocol, version }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `hotspots` | `options?` | `{ hotspots, status }` | Top 20 resources by access count in the given time window |
| `ingest` | `event_json` | `{ status }` | Ingest a single structured audit event |
| `ingestBatch` | `events_json` | `{ ingested, status }` | Ingest multiple events in a single call |
| `ping` | `` | `{}` | Keepalive |
| `query` | `options?` | `{ events, matched, scanned, status }` | Query events with filter predicates |
| `verify` | `` | `{ per_tenant, status, total, verified }` | Verify the cryptographic hash chain integrity of all events. Returns per-tenant and aggregate verified counts or an error if tampering is detected. |

### Examples

```typescript
const { status } = await db.chronicle.ingest({ /* fields */ });
const { ingested, status } = await db.chronicle.ingestBatch({ /* fields */ });
```

## `db.stash` — Encrypted blob storage with S3 backend and envelope encryption

| Method | Args | Returns | Description |
|--------|------|---------|-------------|
| `auth` | `token` | `{}` | Authenticate this connection with a token |
| `command` | `` | `{}` | List supported commands |
| `fingerprint` | `id, viewer_id, options?` | `{ created_at, s3_key, status, viewer_id }` | Create a viewer-specific encrypted copy of a blob for leak tracing |
| `health` | `` | `{}` | Health check |
| `hello` | `` | `{ capabilities, commands, engine, protocol, version }` | Engine identity handshake — returns engine name, version, wire protocol, supported commands, and capability tags. Pre-auth; clients issue this on connect to verify they are talking to the expected engine and version. |
| `inspect` | `id` | `{ blob_status, client_encrypted, content_type, created_at, encrypted_size, id, key_version, keyring, plaintext_size, status, updated_at, viewer_count }` | Read blob metadata without downloading or decrypting |
| `list` | `options?` | `{ blobs, count, status, tenant }` | List blobs for the current tenant |
| `ping` | `` | `{}` | Ping-pong |
| `retrieve` | `id` | `{}` | Retrieve and decrypt a blob |
| `revoke` | `id, options?` | `{ id, revoke_mode, status }` | Revoke a blob (hard crypto-shred by default, SOFT for soft revoke) |
| `rewrap` | `id` | `{ id, key_version, status, updated_at }` | Re-wrap a blob's DEK under the current Cipher key version. The blob ciphertext is not re-encrypted — only the key wrapping changes. |
| `store` | `id, data_b64, options?` | `{ client_encrypted, content_hash, deduplicated, encrypted_size, id, key_version, keyring, plaintext_size, s3_key, status }` | Store an encrypted blob |
| `trace` | `id` | `{ blob_status, id, status, viewer_count, viewers }` | Return the viewer map (who has copies) for a blob |

### Examples

```typescript
const { created_at, s3_key, status, viewer_id } = await db.stash.fingerprint('alice', 'viewer_id');
const { blob_status, client_encrypted, content_type, created_at, encrypted_size, id, key_version, keyring, plaintext_size, status, updated_at, viewer_count } = await db.stash.inspect('alice');
await db.stash.retrieve('alice');
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
| `ACCOUNT_LOCKED` | Account locked after too many failed attempts. Only emitted for credential fields whose CredentialPolicy carries a non-null LockoutPolicy. |
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
| `CIPHER_UNAVAILABLE` | Cipher engine not available for envelope encryption |
| `CLIENT_ENCRYPTED` | Cannot fingerprint a client-encrypted blob (client manages encryption) |
| `CRYPTO` | Encryption or decryption failed |
| `DUPLICATE_VIEWER` | Viewer already has a fingerprinted copy of this blob |
| `INVALID_ARGUMENT` | Invalid argument |
| `OBJECT_STORE` | S3 object store operation failed |
| `REVOKED` | Blob has been soft-revoked |
| `SHREDDED` | Blob has been crypto-shredded (unrecoverable) |
| `STORE` | ShrouDB Store (metadata) operation failed |

## Common Mistakes

- Always `await db.close()` to release connection pool resources
- Engine methods handle serialization — pass JS objects for JSON params, not `JSON.stringify()`
- Accessing an engine without a configured URI throws immediately — check your `ShrouDBOptions`
- Boolean keyword params (like `convergent`, `force`) are flags — `true` sends the keyword, `false`/`undefined` omits it
