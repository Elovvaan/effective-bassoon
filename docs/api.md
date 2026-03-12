# API Usage Guide

Base URL (local default): `http://localhost:3000/api`

## Authentication and request context

### Auth flow

- Login endpoint: `POST /auth/login`
- Returns access token + user profile.
- Backend currently authorizes domain access primarily from request context headers:
  - `x-user-id`
  - `x-district-id`
  - `x-school-id` (optional)
  - `x-role` (`district_admin | school_admin | teacher | student`)

> The frontend sends both `Authorization: Bearer <token>` and the `x-*` context headers for each authenticated request.

### Common error shapes

- Validation errors (`400`):
  ```json
  {
    "message": "Validation failed",
    "issues": [ ...zodIssues ]
  }
  ```
- Application errors (`4xx`):
  ```json
  {
    "message": "...",
    "details": { ...optional }
  }
  ```
- Unhandled (`500`):
  ```json
  {
    "message": "Internal server error"
  }
  ```

---

## Domain: Health

### `GET /health`

- Auth: none
- Response:
  ```json
  {
    "status": "ok",
    "env": "development"
  }
  ```

---

## Domain: Auth

### `POST /auth/login`

Authenticate a user by email + password.

- Auth: none
- Request body:
  ```json
  {
    "email": "district.admin@metro.demo",
    "password": "Password123!"
  }
  ```
- Success response (`200`):
  ```json
  {
    "accessToken": "uuid-token",
    "tokenType": "Bearer",
    "user": {
      "id": "usr_123",
      "name": "Avery Brooks",
      "role": "district_admin",
      "schoolId": null,
      "districtId": "dst_123"
    }
  }
  ```

---

## Domain: Users (`/users`)

### Endpoints

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

### Role permissions

- `GET /users`: `district_admin`, `school_admin`
- `POST /users`: `district_admin`, `school_admin`
- `PATCH /users/:id`: `district_admin`, `school_admin`
- `DELETE /users/:id`: `district_admin`
- `GET /users/:id`: any authenticated role with valid context headers

### Request shapes

- List query:
  - `page?: number`
  - `pageSize?: number`
  - `search?: string`
  - `schoolId?: string`
  - `role?: string`
- Create / update body:
  ```json
  {
    "schoolId": "sch_123",
    "role": "teacher",
    "email": "new.teacher@metro.demo",
    "firstName": "New",
    "lastName": "Teacher",
    "isActive": true
  }
  ```

---

## Domain: Schools (`/schools`)

### Endpoints

- `GET /schools`
- `GET /schools/:id`
- `POST /schools`
- `PATCH /schools/:id`
- `DELETE /schools/:id`

### Role permissions

- `POST/PATCH/DELETE`: `district_admin` only
- `GET /schools`, `GET /schools/:id`: any authenticated role with valid context headers

### Request shapes

- List query:
  - `page?: number`
  - `pageSize?: number`
  - `search?: string`
- Create / update body:
  ```json
  {
    "name": "Central Elementary",
    "code": "CES",
    "timezone": "America/Los_Angeles"
  }
  ```

---

## Domain: Classes (`/classes`)

### Endpoints

- `GET /classes`
- `GET /classes/:id`
- `POST /classes`
- `PATCH /classes/:id`
- `DELETE /classes/:id`

### Role permissions

- `POST/PATCH`: `district_admin`, `school_admin`, `teacher`
- `DELETE`: `district_admin`, `school_admin`
- `GET` routes: any authenticated role with valid context headers

### Request shapes

- List query:
  - `page?: number`
  - `pageSize?: number`
  - `schoolId?: string`
  - `teacherId?: string`
- Create / update body:
  ```json
  {
    "schoolId": "sch_123",
    "teacherId": "usr_teacher_1",
    "name": "ELA Nguyen - Period 1",
    "courseCode": "ELA-11",
    "academicYear": "2025-2026",
    "term": "Fall",
    "period": "1"
  }
  ```

---

## Domain: Assignments (`/assignments`)

### Endpoints

- `GET /assignments`
- `GET /assignments/:id`
- `POST /assignments`
- `PATCH /assignments/:id`
- `DELETE /assignments/:id`

### Role permissions

- `POST/PATCH/DELETE`: `district_admin`, `school_admin`, `teacher`
- `GET` routes: any authenticated role with valid context headers

### Request shapes

- List query:
  - `page?: number`
  - `pageSize?: number`
  - `classroomId?: string`
  - `studentId?: string`
- Create / update body:
  ```json
  {
    "schoolId": "sch_123",
    "classroomId": "cls_123",
    "rubricId": "rub_123",
    "title": "Argumentative Essay",
    "description": "Write a 5-paragraph argument",
    "dueAt": "2026-02-18T23:59:00.000Z",
    "maxPoints": 100
  }
  ```

---

## Domain: Submissions (`/submissions`)

### Endpoints

- `GET /submissions`
- `GET /submissions/:id`
- `POST /submissions`
- `PATCH /submissions/:id`
- `DELETE /submissions/:id`

### Role permissions

- `POST/PATCH`: `district_admin`, `school_admin`, `teacher`, `student`
- `DELETE`: `district_admin`, `school_admin`, `teacher`
- `GET` routes: any authenticated role with valid context headers

### Request shapes

- List query:
  - `page?: number`
  - `pageSize?: number`
  - `assignmentId?: string`
  - `studentId?: string`
  - `status?: DRAFT | SUBMITTED | RETURNED | GRADED`
- Create / update body:
  ```json
  {
    "schoolId": "sch_123",
    "classroomId": "cls_123",
    "assignmentId": "asn_123",
    "studentId": "usr_student_1",
    "status": "SUBMITTED",
    "submittedAt": "2026-02-15T19:22:00.000Z"
  }
  ```

---

## Domain: Rubrics (`/rubrics`)

### Endpoints

- `GET /rubrics`
- `GET /rubrics/:id`
- `POST /rubrics`
- `PATCH /rubrics/:id`
- `DELETE /rubrics/:id`

### Role permissions

- `POST/PATCH`: `district_admin`, `school_admin`, `teacher`
- `DELETE`: `district_admin`, `school_admin`
- `GET` routes: any authenticated role with valid context headers

### Request shapes

- List query:
  - `page?: number`
  - `pageSize?: number`
  - `schoolId?: string`
  - `name?: string`
- Create / update body:
  ```json
  {
    "schoolId": "sch_123",
    "name": "Argumentative Writing Rubric",
    "description": "Core writing rubric",
    "version": 1,
    "criteria": [
      {
        "title": "Claim and Focus",
        "description": "Sustained claim",
        "maxScore": 4,
        "weight": 1,
        "displayOrder": 1
      }
    ]
  }
  ```

---

## Domain: Analytics (`/analytics`)

### Endpoints

- `GET /analytics/summary`

### Role permissions

- `district_admin`, `school_admin`, `teacher`

### Request shapes

- Query:
  - `page?: number`
  - `pageSize?: number`
  - `schoolId?: string`
  - `classroomId?: string`

### Response shape (example)

```json
{
  "scope": "district",
  "activeUsers": 48,
  "completionRate": 0.87,
  "averageScore": 82.4
}
```

---

## Domain: Audit (`/audit`)

### Endpoints

- `GET /audit`
- `POST /audit`

### Role permissions

- `GET /audit`: `district_admin`, `school_admin`
- `POST /audit`: `district_admin`, `school_admin`, `teacher`

### Request shapes

- List query:
  - `page?: number`
  - `pageSize?: number`
  - `entityType?: string`
  - `entityId?: string`
  - `actorUserId?: string`
  - `action?: string`
- Create body: currently passed through as JSON payload to service/repository.

---

## Example cURL requests

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"district.admin@metro.demo","password":"Password123!"}'
```

### List schools (district admin context)

```bash
curl http://localhost:3000/api/schools \
  -H 'Authorization: Bearer <token>' \
  -H 'x-user-id: <user-id>' \
  -H 'x-district-id: <district-id>' \
  -H 'x-role: district_admin'
```

### Create assignment (teacher context)

```bash
curl -X POST http://localhost:3000/api/assignments \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -H 'x-user-id: <teacher-id>' \
  -H 'x-district-id: <district-id>' \
  -H 'x-school-id: <school-id>' \
  -H 'x-role: teacher' \
  -d '{
    "schoolId": "<school-id>",
    "classroomId": "<class-id>",
    "title": "Essay 1",
    "description": "Introductory argument writing"
  }'
```
