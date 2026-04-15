# PDCMS Inpatient Control Desk

Hospital inpatient operations prototype with a static frontend and a Node backend for workload and admission persistence.

## Stack

- Frontend: static HTML, modular CSS, browser-side JavaScript
- Backend: Node.js + Express
- Storage:
  - local development: JSON files in `data/`
  - production: PostgreSQL through `DATABASE_URL`
- Deployment target:
  - frontend: Vercel
  - backend: Render web service
  - database: Supabase Postgres

## What Exists Now

- Staff-facing inpatient workflow UI
- Day-by-day workload checklist with backend persistence
- Admission registration backend with generated patient/admission IDs
- Dashboard summary counts backed by real admission data
- Same-origin serving so the UI and API deploy as one service
- API tests covering health, workloads, admissions, and dashboard summary

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- render.yaml
|-- test/
|   `-- api.test.js
|-- docs/
|   `-- architecture.md
`-- src/
    |-- scripts/
    |   |-- main.js
    |   |-- product/
    |   |   `-- config.js
    |   `-- ui/
    |       |-- admissions.js
    |       |-- navigation.js
    |       |-- reveal.js
    |       `-- workload.js
    |-- server/
    |   |-- app.js
    |   |-- index.js
    |   |-- validation.js
    |   `-- store/
    |       |-- createDataStores.js
    |       |-- fileAdmissionStore.js
    |       |-- fileWorkloadStore.js
    |       |-- postgresAdmissionStore.js
    |       `-- postgresWorkloadStore.js
    `-- styles/
        |-- base.css
        |-- components.css
        |-- layout.css
        |-- main.css
        |-- responsive.css
        |-- states.css
        `-- tokens.css
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

3. Open:

```text
http://localhost:3000
```

When `DATABASE_URL` is not set, the app creates `data/workloads.json` and `data/admissions.json` automatically.

## Environment

Copy `.env.example` if you want local overrides.

- `PORT`: server port, defaults to `3000`
- `DATABASE_URL`: PostgreSQL connection string for shared or production environments

## API

### `GET /api/health`

Returns service status and active storage type.

### `GET /api/dashboard/summary`

Returns dashboard counts derived from admissions.

### `GET /api/workloads?date=YYYY-MM-DD`

Returns the checklist for one day.

### `POST /api/workloads`

Request body:

```json
{
  "date": "2026-04-12",
  "text": "Review discharge summary"
}
```

### `PATCH /api/workloads/:id`

Request body:

```json
{
  "done": true
}
```

### `GET /api/admissions?limit=10`

Returns recent admissions ordered newest first.

### `GET /api/admissions/:id`

Returns one admission record.

### `POST /api/admissions`

Minimum request body:

```json
{
  "fullName": "Taylor Reed",
  "admissionDate": "2026-04-12",
  "department": "Cardiology",
  "status": "Discharge planned"
}
```

The backend generates `patientId` and `admissionId` automatically when they are omitted.

## Testing

Run:

```bash
npm test
```

The test suite covers:

- health endpoint
- workload create/update flow
- admission create flow
- dashboard summary counts
- admission validation failure

## Deployment

### Vercel + Render + Supabase

This repo is now prepared for:

- Vercel hosting the static frontend from `dist/`
- Render running the Express API
- Supabase providing the PostgreSQL database

Use [docs/deployment-vercel-render-supabase.md](docs/deployment-vercel-render-supabase.md) for the exact setup sequence and environment variables.
