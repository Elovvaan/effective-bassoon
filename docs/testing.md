# E2E Test Guide

## Test stack

- Framework: Playwright (`@playwright/test`)
- Config: `apps/e2e/playwright.config.ts`
- Specs: `apps/e2e/tests/*.spec.ts`
- Role login helper: `apps/e2e/tests/helpers/auth.ts`

## 1) How to run tests

### Headless run

```bash
npm run e2e
```

### Interactive runner

```bash
npm run e2e:ui
```

### Point tests at non-default frontend URL

```bash
E2E_BASE_URL=http://127.0.0.1:4173 npm run e2e
```

## 2) Preconditions

Before running E2E:

1. Backend is running and reachable.
2. Frontend is running at Playwright `baseURL` (default `http://127.0.0.1:5173`).
3. Database has seeded demo accounts/data.
4. API base URL in frontend env points to running backend API.

## 3) Current suite coverage

- `auth.spec.ts`
  - Login redirection by role.
  - Route protection against role mismatch.
- `admin-console.spec.ts`
  - District admin visibility of schools/users/classes.
  - User create/edit flow.
  - School admin restricted district-only section.
- `teacher-dashboard.spec.ts`
  - Teacher dashboard sections and analytics navigation.
- `student-portal.spec.ts`
  - Assignment visibility and submission status update.
- `analytics.spec.ts`
  - Scope-specific metrics by role (district/school/class).

## 4) Interpreting failures

Common failure patterns:

- **Timeout waiting for element**
  - Usually app failed to load data or selector changed.
  - Verify backend is healthy and seed data exists.
- **Unexpected redirect / URL mismatch**
  - Usually auth failed or role route guard changed.
  - Check login API response and role mapping.
- **HTTP 4xx/5xx in console/network**
  - Inspect backend logs for validation/permission errors.
  - Confirm required `x-*` context headers are being sent.
- **Flaky assertions**
  - Prefer stable `data-testid` selectors and explicit waits around state transitions.

Artifacts available on retries/failure:

- Trace (on first retry)
- Screenshot (on failure)
- Video (on failure)
- HTML report (Playwright reporter)

## 5) How to add new tests

1. Identify user journey and role.
2. Add/extend spec file under `apps/e2e/tests/`.
3. Reuse `loginAsRole(page, role)` helper for setup.
4. Prefer `data-testid` selectors over text-only selectors.
5. Keep tests independent and idempotent:
   - create unique records using timestamp suffixes where needed.
6. Add assertions for both happy path and key authorization boundaries.
7. Run `npm run e2e` locally before merge.

### Minimal spec template

```ts
import { expect, test } from '@playwright/test'
import { loginAsRole } from './helpers/auth'

test('teacher can access feature X', async ({ page }) => {
  await loginAsRole(page, 'teacher')
  await page.goto('/teacher')
  await expect(page.getByTestId('feature-x')).toBeVisible()
})
```
