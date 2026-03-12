# Role Matrix

This matrix reflects platform behavior across frontend route guards and backend route authorization.

| Capability | District Admin | School Admin | Teacher | Student |
|---|---|---|---|---|
| Log in to platform | ✅ | ✅ | ✅ | ✅ |
| Access `/admin` console | ✅ | ✅ | ❌ | ❌ |
| Access analytics page (`/analytics`) | ✅ | ✅ | ✅ | ❌ |
| Access teacher dashboard (`/teacher`) | ❌ | ❌ | ✅ | ❌ |
| Access student portal (`/student`) | ❌ | ❌ | ❌ | ✅ |
| View users list | ✅ | ✅ | ❌ | ❌ |
| Create/update users | ✅ | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ | ❌ |
| View schools | ✅ | ✅ | ✅* | ✅* |
| Create/update/delete schools | ✅ | ❌ | ❌ | ❌ |
| View classes | ✅ | ✅ | ✅ | ✅* |
| Create/update classes | ✅ | ✅ | ✅ | ❌ |
| Delete classes | ✅ | ✅ | ❌ | ❌ |
| View assignments | ✅ | ✅ | ✅ | ✅ |
| Create/update/delete assignments | ✅ | ✅ | ✅ | ❌ |
| View submissions | ✅ | ✅ | ✅ | ✅ |
| Create/update submissions | ✅ | ✅ | ✅ | ✅ |
| Delete submissions | ✅ | ✅ | ✅ | ❌ |
| View rubrics | ✅ | ✅ | ✅ | ✅* |
| Create/update rubrics | ✅ | ✅ | ✅ | ❌ |
| Delete rubrics | ✅ | ✅ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ |
| Create audit log event | ✅ | ✅ | ✅ | ❌ |

`*` Backend routes without `requireRoles` are technically available to any request that includes valid context headers; practical UX access still depends on frontend navigation and page-specific data calls.

## District admin

- District-wide governance and setup:
  - Full school lifecycle management.
  - Full user lifecycle including delete.
  - Full class/assignment/rubric/submission visibility and management.
  - Analytics and audit visibility.

## School admin

- School-operations manager:
  - Can manage users (except delete), classes, assignments, rubrics, submissions.
  - Can access analytics and audit logs.
  - Cannot create/update/delete schools.

## Teacher

- Instructional owner:
  - Can manage classes (create/update), assignments, rubrics (create/update), and submissions.
  - Can access analytics scoped to class/school context.
  - Cannot access admin console or audit query endpoint.

## Student

- Learning workflow participant:
  - Can access student portal.
  - Can create/update own submission records (per backend route permissions).
  - Cannot access admin/analytics and cannot perform admin CRUD operations.
