# Load Testing Suite (k6)

This workspace contains a k6-based load-testing harness for backend district-scale performance validation.

## Prerequisites

1. Install [k6](https://k6.io/docs/get-started/installation/).
2. Ensure the backend API is reachable (local or deployed).

## Environment variables

All scripts support the same environment variables:

- `BASE_URL` (default: `http://localhost:3000`) — backend base URL.
- `API_PREFIX` (default: `/api`) — API prefix used by backend routes.
- `VUS` (default: `100`) — virtual users for constant-vus scenarios.
- `DURATION` (default: `2m`) — test duration.
- `RAMPING` (default: `false`) — set to `true` to enable ramping profile.
- `RAMPING_STAGES` (default: `30s:20,1m:100,30s:0`) — stage format `<duration>:<target>,...`.

## Demo credentials

These scripts use seeded demo users:

- `district.admin@metro.demo`
- `principal.nhs@metro.demo`
- `teacher1@metro.demo`
- `student1@metro.demo`
- password for all: `Password123!`

## Run scenarios

From repository root:

```bash
npm run load:auth
npm run load:teacher
npm run load:student
npm run load:admin
npm run load:analytics
```

With overrides:

```bash
BASE_URL=https://your-render-backend.example.com VUS=150 DURATION=5m npm run load:teacher
BASE_URL=http://localhost:3000 RAMPING=true RAMPING_STAGES="1m:25,3m:100,1m:150,1m:0" npm run load:analytics
```

## Thresholds / SLOs

Each script fails when these thresholds are violated:

- `http_req_duration` p95 < 250ms
- `http_req_duration` p99 < 500ms
- `http_req_failed` rate < 0.1%

Each workflow also tracks per-endpoint custom trends/rates for targeted hotspot analysis.

## Interpreting results

- `http_req_duration` shows latency distribution across all requests.
- Custom `*_duration` metrics show latency by operation (e.g., `teacher_assignments_duration`).
- Custom `*_error_rate` metrics reveal unstable endpoints under load.
- `http_reqs` and `iterations` indicate throughput and pacing.

Use failures plus percentile spikes to decide where to optimize (query/indexing, caching, payload size, or pagination defaults).
