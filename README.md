# @shroudb/sdk

Unified TypeScript SDK for all ShrouDB engines. Provides namespaced, type-safe
access to every engine with built-in serialization, connection pooling, and
dual transport support (RESP3 for direct connections, HTTP for Moat gateway).

## Installation

```bash
npm install @shroudb/sdk
```

## Quick Start

```typescript
import { ShrouDB } from '@shroudb/sdk';

// Connect via Moat gateway (routes all engines through one endpoint)
const db = new ShrouDB({
  moat: 'https://moat.example.com',
  token: 'my-token',
});

// Or connect to individual engines directly
const db = new ShrouDB({
  shroudb: 'shroudb://token@localhost:6399',
  cipher: 'shroudb-cipher://token@localhost:6599',
  sigil: 'sigil://token@localhost:6499',
  veil: 'shroudb-veil://token@localhost:6799',
  sentry: 'shroudb-sentry://token@localhost:6799',
  forge: 'shroudb-forge://token@localhost:6699',
  keep: 'shroudb-keep://token@localhost:6899',
  courier: 'shroudb-courier://token@localhost:6999',
  chronicle: 'chronicle://token@localhost:7099',
  stash: 'shroudb-stash://token@localhost:6399',
});

// Encrypt data
const result = await db.cipher.encrypt('my-keyring', btoa('hello'));
console.log(result.ciphertext);

// Create a user
const user = await db.sigil.userCreate('myapp', 'alice', {
  password: 's3cret',
  email: 'alice@example.com',
});

await db.close();
```

## Connection Modes

### Moat Gateway (HTTP)

Routes all engine commands through a single Moat endpoint via HTTP POST.

```typescript
const db = new ShrouDB({ moat: 'https://moat.example.com', token: 'my-token' });
```

### Moat Gateway (RESP3)

Direct RESP3 connection to Moat with engine-prefixed commands.

```typescript
const db = new ShrouDB({ moat: 'shroudb-moat://my-token@moat.example.com:8201' });
```

### Direct Engine Connections

Connect to individual engines via RESP3. Only configure the engines you need.

```typescript
const db = new ShrouDB({
  cipher: 'shroudb-cipher://token@cipher-host:6599',
  sigil: 'shroudb-sigil://token@sigil-host:6499',
});
```

### Mixed Mode

Route most engines through Moat, but connect directly to specific engines.

```typescript
const db = new ShrouDB({
  moat: 'https://moat.example.com',
  cipher: 'shroudb-cipher://token@dedicated-cipher:6599', // direct
  token: 'moat-token',
});
```

## Engines

### `db.shroudb`

Encrypted key-value database

| Method | Description |
|--------|-------------|
| `auth(token)` | Authenticate the connection with a token |
| `commandList()` | List all supported commands |
| `configGet(key)` | Read a runtime configuration value |
| `configSet(key, value)` | Set a runtime configuration value (admin only) |
| `delete(namespace, key)` | Delete a key by writing a tombstone |
| `get(namespace, key, META, options?)` | Retrieve the value at a key |
| `health()` | Check server health |
| `list(namespace, options?)` | List active keys in a namespace |
| `namespaceAlter(name, options?)` | Update namespace configuration (enforce-on-write-only) |
| `namespaceCreate(name, options?)` | Create a new namespace |
| `namespaceDrop(name, FORCE)` | Drop a namespace |
| `namespaceInfo(name)` | Get metadata about a namespace |
| `namespaceList(options?)` | List namespaces (filtered by token grants) |
| `namespaceValidate(name)` | Check existing entries against current MetaSchema |
| `ping()` | Test connectivity |
| `pipeline(count)` | Execute commands atomically (all succeed or all roll back) |
| `put(namespace, key, value, options?)` | Store a value at the given key. Auto-increments version. |
| `subscribe(namespace, options?)` | Subscribe to change events on a namespace |
| `unsubscribe()` | End the current subscription |
| `versions(namespace, key, options?)` | Retrieve version history for a key (most recent first) |

### `db.cipher`

Encryption-as-a-service

| Method | Description |
|--------|-------------|
| `auth(token)` | Authenticate the connection |
| `commandList()` | List all supported commands |
| `decrypt(keyring, ciphertext, options?)` | Decrypt ciphertext using the embedded key version |
| `encrypt(keyring, plaintext, options?)` | Encrypt plaintext with the active key version |
| `generateDataKey(keyring, options?)` | Generate a data encryption key (envelope encryption pattern) |
| `health()` | Check server health |
| `keyInfo(keyring)` | Get keyring metadata and key version information |
| `keyringCreate(name, algorithm, options?)` | Create a new keyring with its first active key |
| `keyringList()` | List all keyring names |
| `ping()` | Simple connectivity check — returns PONG |
| `rewrap(keyring, ciphertext, options?)` | Re-encrypt ciphertext with the current active key version |
| `rotate(keyring, options?)` | Rotate the keyring to a new key version |
| `sign(keyring, data)` | Create a detached signature |
| `verifySignature(keyring, data, signature)` | Verify a detached signature |

### `db.sigil`

Schema-driven credential envelope engine

| Method | Description |
|--------|-------------|
| `credentialChange(schema, id, field, old, new)` | Change a credential field (requires old value for verification) |
| `credentialImport(schema, id, field, hash, options?)` | Import a pre-hashed credential (bcrypt, scrypt, argon2). Transparently rehashed to Argon2id on next verify. |
| `credentialReset(schema, id, field, new)` | Force-reset a credential field without requiring old value (admin/reset token) |
| `envelopeCreate(schema, id, json)` | Create an envelope with field routing per schema annotations |
| `envelopeDelete(schema, id)` | Delete an envelope and all associated data |
| `envelopeGet(schema, id)` | Get an envelope record |
| `envelopeImport(schema, id, json)` | Import an envelope with pre-hashed credential fields. Non-credential fields processed normally. |
| `envelopeLookup(schema, field, value)` | Look up an envelope by indexed or searchable field value |
| `envelopeUpdate(schema, id, json)` | Update non-credential fields on an existing envelope |
| `envelopeVerify(schema, id, field, value)` | Verify a credential field on an envelope by explicit field name |
| `health()` | Health check |
| `jwks(schema)` | Get the JSON Web Key Set for external token verification |
| `passwordChange(schema, id, old, new)` | Sugar: change password. Infers credential field from schema. Equivalent to CREDENTIAL CHANGE with implicit field. |
| `passwordImport(schema, id, hash, options?)` | Sugar: import pre-hashed password. Infers credential field from schema. Equivalent to CREDENTIAL IMPORT with implicit field. |
| `passwordReset(schema, id, new)` | Sugar: force-reset password. Infers credential field from schema. Equivalent to CREDENTIAL RESET with implicit field. |
| `schemaGet(name)` | Get a schema definition by name |
| `schemaList()` | List all registered schema names |
| `schemaRegister(name, json)` | Register a credential envelope schema |
| `sessionCreate(schema, id, password, options?)` | Verify credentials and issue access + refresh tokens |
| `sessionList(schema, id)` | List active sessions for an entity |
| `sessionRefresh(schema, token)` | Rotate refresh token and issue new access token |
| `sessionRevoke(schema, token)` | Revoke a single refresh token (logout one session) |
| `sessionRevokeAll(schema, id)` | Revoke all sessions for an entity (logout everywhere) |
| `userCreate(schema, id, json)` | Sugar: create an envelope. Equivalent to ENVELOPE CREATE. |
| `userDelete(schema, id)` | Sugar: delete an envelope. Equivalent to ENVELOPE DELETE. |
| `userGet(schema, id)` | Sugar: get an envelope. Equivalent to ENVELOPE GET. |
| `userImport(schema, id, json)` | Sugar: import an envelope with pre-hashed credentials. Equivalent to ENVELOPE IMPORT. |
| `userUpdate(schema, id, json)` | Sugar: update non-credential fields. Equivalent to ENVELOPE UPDATE. |
| `userVerify(schema, id, password)` | Sugar: verify credential. Infers the credential field from schema. Equivalent to ENVELOPE VERIFY with implicit field. |

### `db.veil`

veil

| Method | Description |
|--------|-------------|
| `auth(token)` | Authenticate this connection |
| `commandList()` | List all supported commands |
| `delete(index, id)` | Remove an entry's blind tokens from the index |
| `health()` | Health check |
| `indexCreate(name)` | Create a new blind index with a fresh HMAC key |
| `indexInfo(name)` | Get information about a blind index |
| `indexList()` | List all blind index names |
| `ping()` | Ping-pong |
| `put(index, id, data_b64, options?)` | Store blind tokens for an entry. In standard mode, data_b64 is base64-encoded plaintext (server tokenizes). With BLIND flag, data_b64 is base64-encoded BlindTokenSet JSON (client pre-tokenized, for E2EE). |
| `search(index, query, options?)` | Search a blind index. In standard mode, query is plain text (server tokenizes). With BLIND flag, query is base64-encoded BlindTokenSet JSON (client pre-tokenized, for E2EE). |
| `tokenize(index, plaintext_b64, options?)` | Generate blind tokens from plaintext without storing. Returns HMAC-derived tokens for external use. |

### `db.sentry`

sentry

| Method | Description |
|--------|-------------|
| `auth(token)` | Authenticate the connection with a token |
| `commandList()` | List all supported commands |
| `evaluate(json)` | Evaluate an authorization request against policies and return a signed decision |
| `health()` | Server health check |
| `jwks()` | Get the JSON Web Key Set for verifying decision tokens |
| `keyInfo()` | Get signing key metadata |
| `keyRotate(options?)` | Rotate the signing key |
| `ping()` | Connectivity check |
| `policyCreate(name, json)` | Create a new authorization policy |
| `policyDelete(name)` | Delete a policy |
| `policyGet(name)` | Get a policy by name |
| `policyList()` | List all policy names |
| `policyUpdate(name, json)` | Update an existing policy |

### `db.forge`

Internal certificate authority engine

| Method | Description |
|--------|-------------|
| `caCreate(name, algorithm, subject, options?)` | Create a new Certificate Authority |
| `caExport(name)` | Export the active CA certificate (PEM) |
| `caInfo(name)` | Get CA metadata and key version status |
| `caList()` | List all Certificate Authorities |
| `caRotate(name, options?)` | Rotate CA signing key |
| `inspect(ca, serial)` | Get certificate details |
| `issue(ca, subject, profile, options?)` | Issue a new certificate. Returns cert + private key (private key never stored). |
| `issueFromCsr(ca, csr_pem, profile, options?)` | Issue a certificate from a PEM-encoded CSR |
| `listCerts(ca, options?)` | List certificates for a CA |
| `renew(ca, serial, options?)` | Renew a certificate (re-issue with same profile and SANs) |
| `revoke(ca, serial, options?)` | Revoke a certificate |

### `db.keep`

Secrets manager with path-based access control and versioning

| Method | Description |
|--------|-------------|
| `auth(token)` | Authenticate this connection with a token. |
| `commandList()` | List all supported commands. |
| `delete(path)` | Soft-delete a secret. Version history is preserved. |
| `get(path, options?)` | Retrieve a secret value. Returns the latest version by default. |
| `health()` | Health check. |
| `list(prefix)` | List secret paths, optionally filtered by prefix. Excludes deleted secrets. |
| `ping()` | Ping-pong. |
| `put(path, value)` | Store a new version of a secret. Creates the secret if it doesn't exist. Undeletes if soft-deleted. |
| `rotate(path)` | Re-encrypt the latest version with a new nonce. Creates a new version with the same plaintext. |
| `versions(path)` | Get version history for a secret. Includes deleted secrets. |

### `db.courier`

Just-in-time decryption delivery engine

| Method | Description |
|--------|-------------|
| `auth(token)` | Authenticate the connection with a token |
| `channelCreate(name, type, config_json)` | Create a delivery channel |
| `channelDelete(name)` | Delete a channel |
| `channelGet(name)` | Get channel configuration |
| `channelList()` | List all channels |
| `commandList()` | List available commands |
| `deliver(json)` | Decrypt recipient and deliver a message |
| `health()` | Server health check |
| `notifyEvent(channel, subject, body)` | Trigger a notification on a pre-configured channel (e.g. rotation/expiry alerts) |
| `ping()` | Connectivity check |

### `db.chronicle`

Structured audit event engine

| Method | Description |
|--------|-------------|
| `actors(options?)` | Active actors in time window |
| `auth(token)` | Authenticate this connection |
| `count(options?)` | Count events matching filter predicates |
| `errors(options?)` | Error rates by action |
| `health()` | Health check |
| `hotspots(options?)` | Top actors by event volume |
| `ingest(event_json)` | Ingest a single structured audit event |
| `ingestBatch(events_json)` | Ingest multiple events in a single call |
| `ping()` | Keepalive |
| `query(options?)` | Query events with filter predicates |

### `db.stash`

Encrypted blob storage with S3 backend and envelope encryption

| Method | Description |
|--------|-------------|
| `command()` | List supported commands |
| `health()` | Health check |
| `inspect(id)` | Read blob metadata without downloading or decrypting |
| `ping()` | Ping-pong |
| `retrieve(id)` | Retrieve and decrypt a blob |
| `revoke(id, options?)` | Revoke a blob (hard crypto-shred by default, SOFT for soft revoke) |
| `store(id, data_b64, options?)` | Store an encrypted blob |

## Error Handling

```typescript
import { ShrouDBError, ErrorCode } from '@shroudb/sdk';

try {
  await db.cipher.encrypt('missing-keyring', data);
} catch (err) {
  if (err instanceof ShrouDBError && err.code === ErrorCode.NOTFOUND) {
    console.log('Keyring not found');
  }
}
```
