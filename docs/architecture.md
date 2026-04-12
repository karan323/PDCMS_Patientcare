# Architecture Notes

## Current Target

This repository is now a single deployable product slice:

- static browser UI for the inpatient operations desk
- Node backend for workload persistence
- storage abstraction that runs on local file storage or PostgreSQL

That keeps the app simple enough to move quickly now, while leaving a clean path to a larger product later.

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

## Backend

- `src/server/index.js`
  Process entry point.

- `src/server/app.js`
  Express app setup, API routes, static asset serving, and fallback routing.

- `src/server/store`
  Persistence boundary:
  - `fileWorkloadStore.js` for local development
  - `postgresWorkloadStore.js` for shared and production environments
  - `createWorkloadStore.js` to select the correct storage mode

## Why This Shape

- The frontend stays framework-light while product requirements are still moving.
- The backend stays small and deployable as one service.
- Local development works without external infrastructure.
- Production can switch to PostgreSQL without changing the UI contract.

## Current API Boundary

- `GET /api/health`
- `GET /api/workloads?date=YYYY-MM-DD`
- `POST /api/workloads`
- `PATCH /api/workloads/:id`

This is intentionally narrow. It only covers the part of the UI that currently has real state.

## Deployment Recommendation

### Best immediate option

Render web service + Render Postgres.

Reason:

- one repository
- one Node process
- one managed database
- simple environment setup through `render.yaml`

### Better long-term option

Supabase becomes a better platform if the next phase includes:

- authentication
- multiple staff roles
- audit access rules
- document storage
- richer reporting queries

## Next Backend Steps

1. Add patient, admission, and doctor scheduling domain models.
2. Add authentication and role-based authorization.
3. Move workload validation into shared server-side schemas.
4. Add API tests for the workload endpoints.
5. Replace file storage in shared environments with PostgreSQL only.
