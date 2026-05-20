# Smart Mbarara – Civic Issue Reporting System

A multi-sector civic platform where Mbarara city residents report issues (roads, water, waste, health, etc.) and authorities track and resolve them.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/smart-mbarara run dev` — run the frontend (port 20584)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Recharts + wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/reports.ts` — `civic_reports` Drizzle table definition
- `artifacts/api-server/src/routes/reports.ts` — CRUD routes for civic reports
- `artifacts/api-server/src/routes/stats.ts` — Dashboard stats endpoints
- `artifacts/smart-mbarara/src/pages/` — All frontend pages
- `artifacts/smart-mbarara/src/components/` — Shared UI components

## Architecture decisions

- OpenAPI-first: the spec gates codegen which gates the frontend; routes use Orval-generated Zod schemas for validation
- Department auto-assignment: mapped server-side from category on report creation (not stored separately)
- Status-only PATCH: separate `/reports/:id/status` endpoint for admin status updates keeps the operation atomic
- No authentication for MVP: admin dashboard is publicly accessible at `/admin`
- Seed data: 7 example reports pre-loaded across all categories to demonstrate the dashboard

## Product

- **Citizens** — submit issue reports (home page, `/report`)
- **Public** — view all reports transparently with category/status filters (`/reports`)
- **Admins** — full dashboard with stats charts, all reports table with filters, per-report detail view with status update buttons (`/admin`, `/admin/reports/:id`)
- **Categories**: Waste Management, Health, Education, Security, Water Supply, Electricity, Roads & Transport, Other
- **Statuses**: Pending → In Progress → Resolved

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always re-run codegen after changing `lib/api-spec/openapi.yaml`
- Do not use deep imports into `@workspace/api-client-react/src/generated/*` — import from `@workspace/api-client-react` directly
- The `civic_reports` table uses snake_case columns; Drizzle maps them to camelCase in TypeScript

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
