# shroudb-auth-client

Authentication service

> Auto-generated from the shroudb-auth API spec. Do not edit.

## Installation

```bash
npm install shroudb-auth-client
```

## Quick Start

```typescript
import { ShroudbAuthClient } from "shroudb-auth-client";

const client = new ShroudbAuthClient("http://localhost:4001");
const result = await client.changePassword("example_new_password", "example_old_password");
console.log(result);
```

## API

### `new ShroudbAuthClient(baseUrl: string, keyspace?: string)`

Creates a new client. The `keyspace` parameter defaults to `"default"`.

### Methods

- **`changePassword(newPassword: string, oldPassword: string)`** — Change password for the currently authenticated user
- **`forgotPassword(userId: string)`** — Request a password reset token (always returns 200 to prevent enumeration)
- **`health()`** — Health check endpoint
- **`jwks()`** — Public JSON Web Key Set for verifying access tokens
- **`login(password: string, userId: string)`** — Authenticate a user and receive access + refresh tokens
- **`logout()`** — Revoke the current refresh token family and clear cookies
- **`logoutAll(userId: string)`** — Revoke all refresh token families for a user
- **`refresh()`** — Exchange a refresh token for new access + refresh tokens
- **`resetPassword(newPassword: string, token: string)`** — Reset password using a single-use reset token (revoked after use)
- **`session()`** — Validate current session and return user info
- **`sessions()`** — List active sessions (refresh token families) for the authenticated user
- **`signup(password: string, userId: string, options?: SignupOptions)`** — Register a new user and receive access + refresh tokens

## License

Apache-2.0
