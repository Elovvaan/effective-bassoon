# Effective Bassoon Backend Documentation

This repository currently focuses on baseline project documentation for a modular education platform backend. It includes an OpenAPI contract, module-level docs, and a relational data model guide.

## Architecture Map

The backend is organized as domain modules behind a single API surface:

- **Auth Module**: user identity, login, token/session lifecycle, role mapping.
- **SIS Module**: student information system entities such as schools, sections, enrollments.
- **Assessments Module**: question banks, assessments, attempts, scoring events.
- **Analytics Module**: aggregate metrics and trend views from events/attempts.
- **Audit Logging Module**: immutable activity trail for sensitive operations.

### Suggested Layering

1. **API Layer**
   - REST endpoints (see `docs/openapi.yaml`).
2. **Application Layer**
   - Use-case services per module.
3. **Domain Layer**
   - Validation, policies, and domain rules.
4. **Infrastructure Layer**
   - Persistence, caching, queues, and external integrations.

### Cross-Cutting Concerns

- Authentication + authorization
- Request validation
- Idempotency for write-heavy endpoints
- Observability (logs, metrics, traces)
- Audit events for privileged changes

## Setup Steps

> Adjust commands as needed for your runtime (Node, Python, Java, etc.).

1. Clone the repo.
2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Install dependencies:

   ```bash
   # Example (Node)
   npm install
   ```

4. Run migrations/seeding:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start API server:

   ```bash
   npm run dev
   ```

6. Optional: start background workers:

   ```bash
   npm run worker
   ```

## Scripts

A recommended script surface for consistency:

- `npm run dev` — start API in watch mode.
- `npm run start` — run API in production mode.
- `npm run test` — execute unit/integration tests.
- `npm run lint` — static linting.
- `npm run typecheck` — type validation.
- `npm run db:migrate` — apply schema migrations.
- `npm run db:seed` — load baseline reference data.
- `npm run worker` — run async job worker.

## Environment Variables

Use `.env` for local development and secure secret stores in production.

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | yes | Runtime environment (`development`, `test`, `production`). |
| `PORT` | yes | API HTTP port. |
| `DATABASE_URL` | yes | Primary relational database connection string. |
| `REDIS_URL` | recommended | Cache/queue broker URL. |
| `JWT_ISSUER` | yes | Token issuer claim. |
| `JWT_AUDIENCE` | yes | Token audience claim. |
| `JWT_PRIVATE_KEY` | yes | Private key for access token signing. |
| `JWT_PUBLIC_KEY` | yes | Public key for token verification. |
| `SIS_PROVIDER` | optional | SIS integration provider identifier. |
| `ANALYTICS_WRITE_ENABLED` | optional | Toggle analytics event writes. |
| `AUDIT_LOG_RETENTION_DAYS` | optional | Data retention policy for audit records. |
| `LOG_LEVEL` | recommended | Logging verbosity (`debug`, `info`, etc.). |
| `CORS_ALLOWED_ORIGINS` | recommended | Comma-separated allowed origins. |

## Documentation Index

- API contract: `docs/openapi.yaml`
- Module docs:
  - `docs/modules/auth.md`
  - `docs/modules/sis.md`
  - `docs/modules/assessments.md`
  - `docs/modules/analytics.md`
  - `docs/modules/audit-logging.md`
- Data model: `docs/data-model.md`
