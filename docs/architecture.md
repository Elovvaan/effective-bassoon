# Architecture Map

## 1) Monorepo Layout

```text
.
├─ apps/
│  ├─ backend/      # Express + Prisma API
│  ├─ frontend/     # React + Vite client
│  └─ e2e/          # Playwright end-to-end suite
├─ packages/
│  ├─ types/        # Shared TypeScript contracts
│  ├─ ui/           # Shared UI helpers/components
│  └─ utils/        # Shared cross-app utilities
├─ docs/            # OpenAPI, module notes, data docs
└─ render.yaml      # Render blueprint (db + backend + frontend)
```

The repo is configured as an npm workspace monorepo so backend, frontend, E2E, and shared packages are installed/built/tested together from the root. 

## 2) Backend Domain Modules

The backend mounts its API under `API_PREFIX` (default: `/api`) and exposes domain routers from `buildApp()`.

- `GET /health` — liveness/readiness probe.
- `POST /api/auth/login` — authentication.
- `/api/users` — user management.
- `/api/schools` — school CRUD.
- `/api/classes` — classroom CRUD.
- `/api/assignments` — assignment CRUD.
- `/api/submissions` — submission CRUD.
- `/api/rubrics` — rubric CRUD.
- `/api/analytics/summary` — aggregated analytics.
- `/api/audit` — audit list/create.

Each domain uses the same layered pattern:

1. **Controller/Router**: parses request, validates payload, sends HTTP response.
2. **Service**: business logic and policy checks.
3. **Repository**: in-memory/data access implementation boundary.
4. **Common middleware**: async wrapper, error middleware, role guards, request context extraction.

## 3) Frontend Route + Role Structure

Frontend routes are role-gated with `ProtectedRoute` and role-specific layouts:

- Public:
  - `/` → `LoginPage`
- District admin:
  - `/admin` → `AdminConsolePage`
  - `/analytics` → `AnalyticsPage`
- School admin:
  - `/admin` → `AdminConsolePage`
  - `/analytics` → `AnalyticsPage`
- Teacher:
  - `/teacher` → `TeacherDashboardPage`
  - `/analytics` → `AnalyticsPage`
- Student:
  - `/student` → `StudentPortalPage`

`AuthContext` stores active session and exposes `login` / `logout`. The API client forwards session-derived headers (`Authorization`, `x-user-id`, `x-district-id`, `x-school-id`, `x-role`) on authenticated requests.

## 4) Shared Packages

- `@packages/types`
  - Canonical API/domain interfaces shared by backend and frontend (`ApiUser`, `ApiSchool`, `ApiClassroom`, `ApiAssignment`, `ApiSubmission`, analytics types, roles, DTOs).
- `@packages/ui`
  - Shared UI primitives/helpers for client rendering.
- `@packages/utils`
  - Generic utility helpers for common logic.

This keeps type contracts centralized and avoids drift between frontend requests and backend response expectations.

## 5) Data Model Overview

Prisma/Postgres models support district-scoped multi-tenancy and classroom workflows.

### Core hierarchy

- `District` (top-level tenant)
  - has many `School`, `User`, `Classroom`, `Assignment`, `Rubric`, `Submission`, `AuditLog`
- `School`
  - belongs to district; unique `(districtId, code)`

### Identity + authorization

- `Role` (`DISTRICT_ADMIN`, `SCHOOL_ADMIN`, `TEACHER`, `STUDENT`)
- `User`
  - belongs to district, optionally school, belongs to role
  - unique `(districtId, email)`

### Instructional model

- `Classroom` (teacher-owned class section)
- `Enrollment` (student↔classroom membership + status)
- `Assignment` (classroom task, optional rubric)
- `Rubric` + `RubricCriterion`
- `Submission` + `SubmissionVersion`
- `Score` (criterion-level scoring by evaluator)

### Governance

- `AuditLog` captures actor/entity/action metadata for operational traceability.

## 6) Request Lifecycle

1. Client calls frontend API hooks.
2. API client builds request to `VITE_API_BASE_URL` with auth/context headers.
3. Express app parses JSON and applies CORS policy.
4. `requireRoles(...)` (where configured) validates role from `x-role`.
5. DTO validators (`zod`) parse body/query.
6. Controller invokes service.
7. Service applies business rules and calls repository.
8. Response is serialized to JSON.
9. Structured request log is emitted on response finish.
10. If errors occur, centralized error middleware returns normalized error payloads.

## 7) Deployment Topology (Render + Postgres)

`render.yaml` provisions three resources:

1. **Managed Postgres**: `effective-bassoon-db`.
2. **Backend web service**: `effective-bassoon-backend` (Docker runtime)
   - Dockerfile: `apps/backend/Dockerfile`
   - startup command: `npm run prisma:migrate:deploy && npm run start`
   - health check: `/health`
3. **Frontend web service**: `effective-bassoon-frontend` (static site)
   - root: `apps/frontend`
   - build: `npm run build`
   - publish: `dist`

Environment wiring:

- `DATABASE_URL` sourced from Render Postgres connection string.
- Backend receives `FRONTEND_URL` and `BACKEND_URL` from service URLs.
- Frontend uses `VITE_API_BASE_URL` to target backend `/api` origin.

This topology supports a clean split of static UI hosting and stateful API/database concerns while keeping single-repo deployment automation through the Render Blueprint.
