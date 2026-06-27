# OpenNotify Frontend

OpenNotify frontend is a Next.js App Router application used to visualize monitored services, service health, and incidents from the monolith API.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Reusable UI primitives under src/components/ui
- Lucide + Iconify icons

## Features

- Dashboard overview
	- Global service counters: total, up, down
	- Open incidents counter
	- Latency chart and UP vs DOWN health split
	- Monitoring table with latest service checks
	- Auto-refresh every 30 seconds with manual refresh button
- Services management
	- List monitored services
	- Create a service
	- Edit service properties
	- Enable or disable service (optimistic UI update)
	- Delete service with confirmation dialog
	- View latest checks for a selected service
- Incidents view
	- List incidents with open/resolved status
	- Incident detail panel with timestamps and duration

## Application Routes

- /: dashboard page
- /services: services management
- /incidents: incidents list and details

Navigation is provided by the app sidebar and is mounted from the root layout.

## API Integration

The frontend communicates directly with the monolith backend through the typed client in src/lib/api.ts.

Configured base URL:

- MONOLITH_API_URL (environment variable)
- Fallback: http://localhost:3001

Main endpoint groups consumed by the UI:

- /services
- /incidents
- /monitoring

The API client throws an Error for non-2xx responses so pages and widgets can render consistent fetch-error states.

## Getting Started

### 1. Install dependencies

pnpm is recommended because the repository includes pnpm-lock.yaml.

```bash
pnpm install
```

### 2. Configure environment variables

Create a .env.local file in this folder with:

```bash
MONOLITH_API_URL=http://localhost:3001
```

Adjust the URL if your backend runs elsewhere.

### 3. Start the development server

```bash
pnpm dev
```

Open http://localhost:3000.

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Project Structure

```text
src/
	app/
		page.tsx                # Dashboard
		services/page.tsx       # Services CRUD and detail panel
		incidents/page.tsx      # Incidents table and detail panel
		layout.tsx              # Root layout + sidebar shell
	components/
		app-sidebar.tsx         # Main navigation
		StatCard.tsx            # Reusable KPI card
		status.tsx              # Status badges
		ui/                     # Shared UI primitives and error states
	lib/
		api.ts                  # Typed API client
		duration.ts             # Duration and time helpers
		utils.ts                # Styling utility helpers
	hooks/
		use-mobile.ts           # Mobile breakpoint hook
```

## Notes For Contributors

- Keep business/data-fetching logic in page-level containers and reuse presentational components from src/components.
- Reuse the typed methods in src/lib/api.ts instead of ad-hoc fetch calls.
- Prefer existing UI primitives from src/components/ui before introducing new patterns.
- Keep user-facing strings consistent in language per page when making updates.
