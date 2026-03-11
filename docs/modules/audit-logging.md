# Audit Logging Module

## Responsibilities

- Record immutable events for privileged/sensitive actions.
- Track actor, action, entity, and contextual metadata.
- Provide searchable query interface for compliance use cases.

## Core Entities

- `audit_events`

## Event Schema

- `id`
- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata` (JSON)
- `created_at`

## API Surface

- `GET /audit/events`

## Compliance Notes

- Prevent updates/deletes of audit rows at application level.
- Apply retention/export policies according to regulations.
- Consider WORM storage for high-assurance environments.
