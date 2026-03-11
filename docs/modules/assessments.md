# Assessments Module

## Responsibilities

- Assessment template authoring.
- Student attempt lifecycle (start, submit, score).
- Storage of item responses and scoring outcomes.

## Core Entities

- `assessments`
- `assessment_items`
- `attempts`
- `attempt_responses`
- `scores`

## Key Workflows

1. Author and publish assessment content.
2. Start student attempt scoped to enrollment.
3. Persist responses and compute final score.
4. Emit events for analytics and audit modules.

## API Surface

- `GET /assessments`
- `POST /assessments`
- `POST /assessments/{assessmentId}/attempts`

## Domain Notes

- Lock published assessments to preserve scoring consistency.
- Version item banks to support historical replay.
