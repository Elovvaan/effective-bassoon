# Analytics module

Provides service- and route-level support for analytics aggregations at class, school, and district scope.

## Endpoint

- `GET /analytics/:scope`
  - `scope`: `class` | `school` | `district`
  - Query filters:
    - `startDate` / `endDate` (ISO date)
    - `grade`
    - `schoolId`
    - `classId`
  - Pagination:
    - `page`
    - `pageSize`
  - Export:
    - `format=json|csv` (default `json`)

## Response

JSON format:

```json
{
  "data": [
    {
      "scopeId": "class-1",
      "scopeName": "English 7A",
      "submissionCount": 18,
      "averageScore": 84.5,
      "growth": {
        "averageGrowth": 6.2,
        "medianGrowth": 5.0
      },
      "rubricTrends": [
        {
          "criterionId": "claim",
          "criterionName": "Claim & Focus",
          "averageScore": 3.7,
          "trendDelta": 0.5
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 1,
    "totalPages": 1
  }
}
```
