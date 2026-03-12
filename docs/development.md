# Local Development Guide

## Prerequisites

- Node.js + npm
- Postgres database (or connection string)
- npm workspaces enabled (default in this repo)

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment variables

Backend expects these variables:

- `NODE_ENV` (`development` recommended)
- `PORT` (default `3000`)
- `API_PREFIX` (default `/api`)
- `DATABASE_URL`
- `JWT_SECRET` (min 16 chars)
- `FRONTEND_URL` (default `http://localhost:5173`)
- `BACKEND_URL` (default `http://localhost:3000`)

Frontend typically needs:

- `VITE_API_BASE_URL` (for example `http://localhost:3000/api`)

## 3) Run backend (dev mode)

```bash
npm --workspace @apps/backend run dev
```

This uses `node --watch --loader ts-node/esm src/main.ts` for live reload.

## 4) Run frontend (dev mode)

```bash
npm --workspace @apps/frontend run dev
```

Vite defaults to port `5173`.

## 5) Run seed script

After database is available and migrations are applied:

```bash
npm --workspace @apps/backend run seed
```

Seed data includes a demo district, two schools, admins, teachers, students, classes, assignments, rubrics, and submissions.

### Demo account quickstart

- District admin: `district.admin@metro.demo`
- School admin: `principal.nhs@metro.demo`
- Teacher: `teacher1@metro.demo`
- Student: `student1@metro.demo`
- Password (all): `Password123!`

## 6) Run migrations

### Production-safe deploy migrations

```bash
npm --workspace @apps/backend run prisma:migrate:deploy
```

### Local iterative migration workflow (from backend workspace)

```bash
npm --workspace @apps/backend exec prisma migrate dev
```

(Optional) regenerate Prisma client:

```bash
npm --workspace @apps/backend run prisma:generate
```

## 7) Run E2E tests

Ensure backend + frontend are running and seeded, then:

```bash
npm run e2e
```

For interactive Playwright UI:

```bash
npm run e2e:ui
```

## 8) Helpful quality checks

```bash
npm run lint
npm run test
npm run build
```
