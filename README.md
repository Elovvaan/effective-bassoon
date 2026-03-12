# Effective Bassoon Monorepo

Effective Bassoon is a TypeScript monorepo for a district-focused education platform. It includes an Express backend API, a React frontend with role-based experiences, and shared packages for domain types and reusable utilities.

## Monorepo Layout

- `apps/backend` — Express API with modular domain routers and middleware.
- `apps/frontend` — React application with role-protected layouts.
- `packages/types` — Shared domain and API TypeScript interfaces.
- `packages/ui` — Shared UI primitives and rendering helpers.
- `packages/utils` — Shared utility helpers.
- `docs/` — OpenAPI spec, module documentation, and data model notes.

## Backend Architecture

The backend exposes a health endpoint and domain routers under an API prefix.

- `GET /health`
- `/api/auth`
- `/api/users`
- `/api/schools`
- `/api/classes`
- `/api/assignments`
- `/api/submissions`
- `/api/rubrics`
- `/api/analytics`
- `/api/audit`

Domain modules are organized by layered responsibilities:

1. **Routes/Controllers** — HTTP request/response handling.
2. **Services** — Business logic.
3. **Repositories** — Data access abstraction.
4. **Validation and Errors** — Typed validation + centralized error middleware.

## Frontend Architecture

The React app uses protected routes mapped to district roles:

- **District admin:** `/admin`, `/analytics`
- **School admin:** `/admin`, `/analytics`
- **Teacher:** `/teacher`, `/analytics`
- **Student:** `/student`

Authentication state is managed by `AuthContext`. Route-level guards enforce role access.

## Data Model Summary

Prisma models support district-scale multitenancy and instructional workflows:

- Organization: `District`, `School`
- Identity/Access: `User`, `Role`
- SIS and rostering: `Classroom`, `Enrollment`
- Instruction: `Assignment`, `Rubric`, `Submission`
- Compliance: audit/scoring related entities

The schema includes relational constraints and indexes to support district/school scoping and analytics-friendly querying.

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

### 3) Database setup (backend)

```bash
npm --workspace @apps/backend run prisma:migrate
npm --workspace @apps/backend run seed
```

If Prisma migrations are not wired to scripts in your local environment yet, run them directly from `apps/backend` first and then run:

```bash
npm --workspace @apps/backend run seed
```

### Seeded demo accounts

Use the following demo logins after seeding local data:

- District admin: `district.admin@metro.demo`
- School admin (NHS): `principal.nhs@metro.demo`
- School admin (WMS): `principal.wms@metro.demo`
- Teacher: `teacher1@metro.demo`
- Student: `student1@metro.demo`

Password (all demo users): `Password123!`

### 4) Start backend and frontend

```bash
npm --workspace @apps/backend run dev
npm --workspace @apps/frontend run dev
```

## Roles and Route Mapping

| Role | Frontend Routes | Backend Responsibility |
|---|---|---|
| District Admin | `/admin`, `/analytics` | District-wide configuration, reporting, governance |
| School Admin | `/admin`, `/analytics` | School operations, user and class administration |
| Teacher | `/teacher`, `/analytics` | Class management, assignment and submission review |
| Student | `/student` | Assignment completion, feedback and progress |

## End-to-End (E2E) Testing

Playwright E2E tests live in `apps/e2e` and validate full frontend + backend user flows using seeded demo accounts.

### Run E2E tests

```bash
npm run e2e
```

### Run E2E tests in Playwright UI mode

```bash
npm run e2e:ui
```

Before running E2E tests, start backend and frontend locally and seed the demo data as described above.

## Testing and Quality Checks

```bash
npm test
npm run lint
npm run build
```

## Documentation Index

- OpenAPI: `docs/openapi.yaml`
- Data model: `docs/data-model.md`
- Module docs:
  - `docs/modules/auth.md`
  - `docs/modules/sis.md`
  - `docs/modules/assessments.md`
  - `docs/modules/analytics.md`
  - `docs/modules/audit-logging.md`

## Deployment (Render)

This repository includes a `render.yaml` blueprint that provisions:

- `effective-bassoon-db` managed Postgres database.
- `effective-bassoon-backend` Docker web service (`apps/backend/Dockerfile`).
- `effective-bassoon-frontend` static site (`apps/frontend`, published from `dist`).

### Backend (Docker Web Service)

- Dockerfile: `apps/backend/Dockerfile`
- Health check: `GET /health`
- Runtime start command: `npm run prisma:migrate:deploy && npm run start`
- Prisma datasource is configured via `DATABASE_URL`.

Environment variables are validated in `apps/backend/src/config/env.ts` and must include:

- `API_PREFIX`
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `BACKEND_URL`

Use `apps/backend/.env.production.example` as the production template.

### Frontend (Static Site)

Render static site configuration uses:

- Root directory: `apps/frontend`
- Build command: `npm run build`
- Publish directory: `dist`

Use `apps/frontend/.env.production.example` and set at minimum:

- `VITE_API_BASE_URL` (for API requests)
- `VITE_BACKEND_URL`
- `VITE_FRONTEND_URL`

### Deployment steps

1. Push to your GitHub repository.
2. In Render, create a new **Blueprint** and select this repo.
3. Render reads `render.yaml`, provisions database + services, and wires `DATABASE_URL`.
4. Set/override environment values (notably `JWT_SECRET` and `VITE_API_BASE_URL`) in Render dashboard if needed.
5. Deploy. Backend runs Prisma migrations on startup using `prisma migrate deploy`.
