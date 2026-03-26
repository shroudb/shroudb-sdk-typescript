# ShrouDB TypeScript SDK

Typed TypeScript client for all ShrouDB engines. Auto-generated from protocol specs.

## Install

```bash
npm install @shroudb/sdk
```

## Usage

```typescript
import { ShrouDB } from '@shroudb/sdk';

const db = new ShrouDB({ url: 'shroudb://localhost' });

// Vault — credential management
const cred = await db.vault.issue('my-keyspace', { ttl: 3600 });

// Transit — encryption-as-a-service
const encrypted = await db.transit.encrypt('my-key', plaintext);

// Keep — secret storage
await db.keep.put('secret-name', value);
const secret = await db.keep.get('secret-name');

// Mint — token minting
const token = await db.mint.issue({ scope: 'read' });

// Sentry — access control
const allowed = await db.sentry.check('user-id', 'resource', 'action');

// Courier — secure delivery
await db.courier.send('recipient', payload);

// Pulse — telemetry
const metrics = await db.pulse.query('cpu.usage', { from: '-1h' });
```

## Engines

| Namespace | Engine | Description |
|-----------|--------|-------------|
| `vault` | Vault | Credential management |
| `transit` | Transit | Encryption-as-a-service |
| `veil` | Veil | Tokenization |
| `sentry` | Sentry | Access control |
| `mint` | Mint | Token minting |
| `keep` | Keep | Secret storage |
| `courier` | Courier | Secure delivery |
| `pulse` | Pulse | Telemetry & metrics |
| `control` | Control | Cluster management |

## License

MIT OR Apache-2.0
