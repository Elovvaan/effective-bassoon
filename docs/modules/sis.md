# SIS Module

## Responsibilities

- School, class, and roster management.
- Student and instructor profile storage.
- Enrollment lifecycle state and term context.

## Core Entities

- `schools`
- `terms`
- `students`
- `instructors`
- `sections`
- `enrollments`

## Key Workflows

1. Import SIS rosters from external provider.
2. Maintain active/inactive enrollments by term.
3. Resolve student-to-section membership for assessments.

## API Surface

- `GET /sis/students`
- `POST /sis/students`
- `POST /sis/enrollments`

## Integration Notes

- Keep external SIS IDs (`external_id`) for reconciliation.
- Use soft deletes to retain historical enrollment data.
