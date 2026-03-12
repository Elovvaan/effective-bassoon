# Deployment Guide (Render)

## 1) Render Blueprint usage

This repo includes `render.yaml` that defines:

- Managed Postgres: `effective-bassoon-db`
- Backend web service (Docker): `effective-bassoon-backend`
- Frontend static web service: `effective-bassoon-frontend`

Deploy using Render Blueprint:

1. Push repository to Git provider.
2. In Render, create **New + > Blueprint**.
3. Select this repository.
4. Render provisions DB and services from `render.yaml`.

## 2) Required environment variables

### Backend

- `NODE_ENV=production`
- `PORT=3000`
- `API_PREFIX=/api`
- `DATABASE_URL` (from Render Postgres connection string)
- `JWT_SECRET` (generated in blueprint; rotate per policy)
- `FRONTEND_URL` (Render service URL of frontend)
- `BACKEND_URL` (Render service URL of backend)

### Frontend

- `VITE_API_BASE_URL` (public backend API URL + `/api`)

## 3) Migration steps

Backend service starts with:

```bash
npm run prisma:migrate:deploy && npm run start
```

This applies pending Prisma migrations before app boot. 

Recommended deployment-safe migration process:

1. Generate migration locally (`prisma migrate dev`) and commit migration SQL.
2. Deploy via Render Blueprint or service redeploy.
3. Let startup run `prisma migrate deploy`.
4. Verify backend `/health` and critical API routes.

## 4) Rollout flow

### Standard rollout

1. Merge to deployment branch.
2. Render auto-deploy kicks in (`autoDeploy: true`).
3. Backend container builds and starts.
4. Migrations execute.
5. Health check `/health` passes.
6. Frontend static build publishes and serves updated assets.

### Recommended validation checklist

- Confirm backend service is healthy.
- Confirm frontend can authenticate against backend.
- Validate one path per role:
  - district admin `/admin`
  - teacher `/teacher`
  - student `/student`
- Validate analytics page loads for permitted roles.
- Spot-check DB schema version in Render database.

## 5) Rollback notes

- **Frontend**: redeploy previous successful static build.
- **Backend**: redeploy prior image/commit; if migration is backward-incompatible, prepare explicit rollback SQL before restoring traffic.
- Keep backward-compatible migrations when possible (expand/contract strategy).
