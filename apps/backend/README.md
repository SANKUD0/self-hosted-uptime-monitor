# OpenNotify Backend

OpenNotify is a monitoring backend built with NestJS, Prisma, PostgreSQL, and BullMQ.
It continuously checks service health (HTTP, TCP, Ping, Docker), stores historical checks,
tracks incidents, and sends notifications to configured user contacts.

## Core Capabilities

- Service management (create, update, enable/disable, delete)
- Scheduled and immediate health checks via Redis-backed queue
- Multi-protocol health checks: HTTP, TCP, Ping, Docker
- Incident lifecycle management (open and resolve)
- Notifications on incident open/resolve (Email and Discord)
- Read models for dashboards (service state and aggregated counters)

## Architecture Overview

The project follows a modular structure with clear layer boundaries:

- Presentation: HTTP controllers
- Application: orchestration/business use cases
- Infrastructure: Prisma repositories, queue workers, protocol adapters
- Domain: interfaces and entities for core concepts

Main modules:

- `services`: service CRUD and monitoring lifecycle trigger points
- `monitoring`: check scheduling, check execution, and service state projections
- `incidents`: incident creation/resolution logic based on failure thresholds
- `notifications`: contact management and notification dispatch

Shared:

- `shared/database`: Prisma integration and lifecycle management

## Runtime Flow

1. `CheckScheduler` registers repeatable jobs for enabled services at startup.
2. `CheckProcessor` consumes `checks` jobs from BullMQ.
3. The processor selects the checker strategy based on service type.
4. Check results are persisted in `Check` and projected to `ServiceState`.
5. `IncidentsService` evaluates failures against `failureThreshold`.
6. Incidents are opened/resolved and `NotificationsService` notifies enabled contacts.

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL
- Redis (for BullMQ)

## Environment Variables

Create a `.env` file in the backend root.

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port (default: `3001`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma |
| `REDIS_HOST` | No | Redis host (default: `localhost`) |
| `REDIS_PORT` | No | Redis port (default: `6379`) |
| `SMTP_HOST` | For email | SMTP server host |
| `SMTP_PORT` | For email | SMTP server port |
| `SMTP_USER` | For email | SMTP username |
| `SMTP_PASSWORD` | For email | SMTP password |
| `SMTP_FROM` | For email | Sender email address |

## Setup

```bash
pnpm install
```

Generate Prisma client and run migrations:

```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

For local development with new migrations:

```bash
pnpm prisma migrate dev
```

## Run

```bash
# development
pnpm run start

# watch mode
pnpm run start:dev

# debug mode
pnpm run start:debug

# production
pnpm run build
pnpm run start:prod
```

## Test and Lint

```bash
pnpm run lint
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

## API Overview

### Services

- `GET /services`
- `GET /services/count`
- `GET /services/count/up`
- `GET /services/count/down`
- `GET /services/:id`
- `GET /services/:id/checks`
- `GET /services/:id/incidents`
- `GET /services/cards/info`
- `POST /services`
- `PATCH /services/:id`
- `PATCH /services/:id/enable-disable`
- `DELETE /services/:id`

### Monitoring

- `GET /monitoring`
- `GET /monitoring/:id`
- `GET /monitoring/:id/checks`

### Incidents

- `GET /incidents`
- `GET /incidents/count/open`

### User Contacts

- `GET /user-contacts`
- `GET /user-contacts/:id`
- `POST /user-contacts`
- `PATCH /user-contacts/:id`
- `DELETE /user-contacts/:id`

## Data Model (Prisma)

Main entities:

- `Service`: monitored target configuration
- `Check`: immutable check history
- `ServiceState`: current/latest service status projection
- `Incident`: downtime periods with resolution tracking
- `UserContact`: alert destinations (EMAIL, DISCORD)

## Notes for Contributors

- Keep module boundaries explicit (avoid cross-module infrastructure coupling).
- Keep domain and use-case semantics in English for consistency.
- Prefer adding comments only where intent is non-obvious.
- Preserve backward compatibility for public API routes.
