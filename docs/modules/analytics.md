# Analytics Module

## Responsibilities

- Aggregate assessment outcomes by student, section, and school.
- Produce longitudinal metrics and proficiency trends.
- Support dashboard-focused query shapes.

## Data Inputs

- Attempt and score events from assessments module.
- Enrollment hierarchy from SIS module.
- Identity dimensions from auth/SIS.

## Key Workflows

1. Consume scoring events.
2. Build materialized summaries per aggregation grain.
3. Serve read-optimized endpoints for dashboards.

## API Surface

- `GET /analytics/student-performance`

## Operational Notes

- Use asynchronous pipelines for heavy recalculation.
- Define freshness SLAs (e.g., <15 minutes for dashboards).
