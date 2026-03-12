# Production Operations Notes

## 1) Logging

The backend emits structured JSON logs per request on response finish with:

- `level`
- `method`
- `path`
- `statusCode`
- `durationMs`
- `env`

Operational recommendations:

- Ingest logs into centralized log storage (Render log stream + external sink if needed).
- Add request correlation IDs for distributed tracing if platform expands.
- Alert on elevated 5xx rate and p95/p99 duration changes.

## 2) CORS behavior

CORS allows requests only when `Origin` is absent or matches:

- `FRONTEND_URL`
- `BACKEND_URL`

Configured headers:

- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Headers: Content-Type, Authorization, x-user-id, x-district-id, x-school-id, x-role`
- `Access-Control-Allow-Methods: GET,POST,PATCH,PUT,DELETE,OPTIONS`

Preflight (`OPTIONS`) returns `204`.

Ops note: when changing domains or enabling preview URLs, update env values to keep origin allowlist aligned.

## 3) Error handling boundaries

Backend error boundary is centralized in middleware:

- Zod validation errors -> `400` with issue list.
- Known `AppError` instances -> explicit status + details.
- Unknown errors -> `500` generic message.

Recommended enhancements:

- Add error codes for machine-readable incident triage.
- Add sanitized server-side stack logging for unhandled exceptions.
- Track error budget and alerting thresholds.

## 4) Health checks

- Health endpoint: `GET /health`
- Response includes status and environment.
- Render backend uses `/health` as service health check path.

Ops runbook usage:

- If health fails, inspect latest deploy logs first (migration or env misconfiguration are common causes).
- Validate database connectivity and env variable presence.

## 5) Scaling considerations

### Backend

- Current backend is stateless at HTTP layer and horizontally scalable.
- Ensure all instances point to shared Postgres and identical env vars.
- Watch for DB connection saturation under high concurrency.

### Database

- Prisma schema includes useful indexes for district/school and analytics queries.
- Monitor slow queries and add targeted indexes as data grows.
- Plan DB tier upgrades before high-stakes windows (grading/reporting periods).

### Frontend

- Static hosting scales automatically for read traffic.
- Keep API origin stable and versioned to avoid stale clients.

### Security/operations hygiene

- Rotate `JWT_SECRET` and manage via Render environment controls.
- Keep CORS origins minimal.
- Review audit logging volume + retention policy.

## 6) Suggested production SLO telemetry

- API availability (`/health` + synthetic business checks)
- Request latency (p50/p95/p99 by endpoint)
- Error rate (4xx and 5xx split)
- DB CPU, memory, active connections, slow query count
- Deploy frequency + change failure rate
