# OpenNotify

OpenNotify is a self-hosted service monitoring platform.

The repository is a pnpm monorepo containing:

- A NestJS backend responsible for checks scheduling, incident lifecycle, and notifications.
- A Next.js frontend used to visualize service status, incidents, and operational metrics.
- Docker Compose services for local PostgreSQL and Redis.

## Repository Architecture

```text
apps/
	backend/    # NestJS + Prisma API and monitoring engine
	frontend/   # Next.js App Router UI
docker-compose.yaml
pnpm-workspace.yaml
```

## Technology Stack

- Monorepo: pnpm workspace
- Backend: NestJS 11, Prisma, PostgreSQL, BullMQ, Redis
- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- Local infrastructure: Docker Compose

## Core Capabilities

- Monitored services management (create, update, enable/disable, delete)
- Multi-protocol health checks (HTTP, TCP, Ping, Docker)
- Incident detection and resolution tracking
- Notification dispatch for incident lifecycle events (Email and Discord)
- Dashboard and operational views for services and incidents

## Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (recommended for local database and Redis)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Local Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL and Redis defined in docker-compose.yaml.

### 3. Configure Backend Environment

Create apps/backend/.env with values matching your local setup.

Minimum expected variables:

```bash
DATABASE_URL=postgresql://DB_USER:DB_PASSWORD@localhost:5433/opennotify
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3001
```

Optional variables for notifications:

```bash
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

### 4. Apply Database Migrations

```bash
pnpm --filter backend prisma generate
pnpm --filter backend prisma migrate deploy
```

### 5. Configure Frontend Environment

Create apps/frontend/.env.local:

```bash
MONOLITH_API_URL=http://localhost:3001
```

### 6. Run Applications

In two terminals:

```bash
pnpm dev:backend
pnpm dev:frontend
```

Default local endpoints:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Workspace Commands

From repository root:

```bash
pnpm dev:backend
pnpm dev:frontend
```

Backend quality checks:

```bash
pnpm --filter backend lint
pnpm --filter backend test
pnpm --filter backend test:e2e
```

Frontend quality checks:

```bash
pnpm --filter frontend lint
pnpm --filter frontend build
```

## API Surface (High Level)

Primary endpoint groups exposed by the backend:

- /services
- /monitoring
- /incidents
- /user-contacts

## Additional Documentation

- Backend details: apps/backend/README.md
- Frontend details: apps/frontend/README.md

## Contribution Guidelines

- Preserve module boundaries and keep business rules in application/domain layers.
- Keep API contracts backward compatible unless a breaking change is explicitly planned.
- Reuse typed clients and shared UI primitives instead of introducing parallel patterns.
- Keep user-facing copy and naming consistent across pages and endpoints.

## License

This project is currently distributed with no explicit open-source license in repository metadata.
