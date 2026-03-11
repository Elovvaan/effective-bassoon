# Auth module

This module adds:

- `POST /login` for credential validation and issuing signed JWT access + refresh tokens.
- `POST /refresh` for refresh-token rotation (old refresh token is revoked on use).
- `POST /logout` for refresh-token revocation.
- Role guards (`requireRoles`) and resource-scoped authorization (`requireResourceAccess`).
- Audit events for auth flows and privilege-sensitive actions.

## Router wiring

```js
const express = require('express');
const { buildAuthRouter } = require('./auth');

app.use('/auth', buildAuthRouter({ authService }));
```

## Protecting routes

```js
const {
  createAuthenticateMiddleware,
  requireRoles,
  requireResourceAccess,
  Roles,
  withPrivilegeAudit,
} = require('./auth');

app.patch(
  '/schools/:schoolId/teachers/:id',
  authenticate,
  requireRoles([Roles.DISTRICT_ADMIN, Roles.SCHOOL_ADMIN]),
  requireResourceAccess((req) => ({
    districtId: req.user.districtId,
    schoolId: req.params.schoolId,
    teacherId: req.params.id,
  })),
  withPrivilegeAudit(auditService, 'teacher_profile_updated', async (req, res) => {
    // perform update
    res.status(200).json({ ok: true });
  })
);
```
