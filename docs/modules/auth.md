# Auth Module

## Responsibilities

- User authentication (username/password, SSO hooks).
- JWT access token issuance and refresh token rotation.
- Role + permission mapping for API authorization.
- Session invalidation (logout, forced sign-out).

## Core Entities

- `users`
- `roles`
- `permissions`
- `role_permissions`
- `user_roles`
- `sessions`

## Key Workflows

1. **Login**: verify credentials, create session, issue token pair.
2. **Refresh**: rotate refresh token and update session state.
3. **Authorize**: resolve user roles/permissions at request time.

## API Surface

- `POST /auth/login`
- `POST /auth/refresh`

## Security Notes

- Hash passwords using Argon2 or bcrypt with strong work factor.
- Enforce short-lived access tokens and revocable refresh tokens.
- Store session fingerprints (IP/user-agent) for anomaly detection.
