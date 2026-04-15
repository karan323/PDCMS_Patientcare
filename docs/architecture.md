# Architecture Notes

## Current Target

This repository is now a single deployable product slice with two real persisted backend domains:

- workload checklist entries by day
- patient admission records

The app still stays small enough to move quickly, but it now has a cleaner path toward a fuller healthcare product.

## Frontend

- `index.html`
  Main workflow shell and module sections.

- `src/styles`
  Design tokens, layout, components, state, and responsive layers.

- `src/scripts/product`
  Product-wide selectors and config.

- `src/scripts/ui`
  Browser behavior by concern:
  - navigation
  - reveal animations
  - workload checklist interactions
  - admission submission and dashboard hydration

## Backend

- `src/server/index.js`
  Process entry point.

- `src/server/app.js`
  Express app setup, API routes, static serving for `index.html` and `/src`, and fallback routing.

- `src/server/validation.js`
  Shared request validation and normalization for server-side payloads.

- `src/server/store`
  Persistence boundary for each domain:
  - file-backed stores for local development
  - PostgreSQL-backed stores for production/shared environments
  - `createDataStores.js` to choose the storage mode

## Current API Boundary

- `GET /api/health`
- `GET /api/dashboard/summary`
- `GET /api/workloads?date=YYYY-MM-DD`
- `POST /api/workloads`
- `PATCH /api/workloads/:id`
- `GET /api/admissions?limit=10`
- `GET /api/admissions/:id`
- `POST /api/admissions`

This is still intentionally narrow, but it now covers both dashboard metrics and admission creation instead of only the workload widget.

## Why This Shape

- The frontend remains framework-light while product requirements are still changing.
- The backend is still one service, so deployment stays simple.
- Local development works without external infrastructure.
- Production can switch to PostgreSQL without changing UI contracts.
- Validation now lives server-side before data reaches storage.

## Security Improvement

The server no longer exposes the whole repository root as static files. It now serves:

- `index.html`
- assets under `/src`

That matters more now that local JSON persistence files exist under `data/`.

## Testing

`test/api.test.js` covers:

- health checks
- workload create/update flow
- admission create flow
- dashboard summary
- validation failures

## Deployment Recommendation

### Best immediate option

Render web service + Render Postgres.

Reason:

- one repository
- one Node process
- one managed database
- simple deployment through `render.yaml`

### Better long-term option

Supabase becomes more attractive when the next phase includes:

- authentication
- multiple staff roles
- audit access rules
- file uploads
- richer reporting and policy-driven access

## Next Backend Steps

1. Add update and discharge endpoints for admissions instead of create-only records.
2. Add doctor availability and appointment scheduling models.
3. Add authentication and role-based authorization.
4. Move database schema management into explicit migrations.
5. Add request logging and structured error handling.
