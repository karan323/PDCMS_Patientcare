# PDCMS Inpatient Control Desk

Hospital inpatient operations prototype with a lightweight frontend and a new Node backend for day-by-day workload records.

## Stack

- Frontend: static HTML, modular CSS, small browser-side JavaScript
- Backend: Node.js + Express
- Storage:
  - local development: JSON file at `data/workloads.json`
  - production: PostgreSQL via `DATABASE_URL`
- Deployment target: Render web service + Render Postgres

## What Exists Now

- Static inpatient control desk UI
- Interactive `Today’s workload` checklist
- Day-by-day workload history through a calendar picker
- Backend API for loading, creating, and updating workload items
- Same-origin serving so the frontend and API deploy as one service

## Project Structure

```text
.
|-- index.html
|-- package.json
|-- render.yaml
|-- docs/
|   `-- architecture.md
`-- src/
    |-- scripts/
    |   |-- main.js
    |   |-- product/
    |   |   `-- config.js
    |   `-- ui/
    |       |-- navigation.js
    |       |-- reveal.js
    |       `-- workload.js
    |-- server/
    |   |-- app.js
    |   |-- index.js
    |   `-- store/
    |       |-- createWorkloadStore.js
    |       |-- fileWorkloadStore.js
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

The app will create `data/workloads.json` automatically when no `DATABASE_URL` is present.

## Environment

Copy `.env.example` if you want to set variables locally.

- `PORT`: server port, defaults to `3000`
- `DATABASE_URL`: PostgreSQL connection string for production or shared environments

## API

### `GET /api/health`

Returns service status and active storage type.

### `GET /api/workloads?date=YYYY-MM-DD`

Returns the checklist for a single day.

### `POST /api/workloads`

Request body:

```json
{
  "date": "2026-04-11",
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

## Deployment

### Recommended first deployment

Render is a good fit here because this project is now one Node service plus one database.

- Web service: serves `index.html`, static assets, and `/api/*`
- Database: Render Postgres
- Blueprint: `render.yaml`

### Better alternative when the app grows

If you expect auth, role-based access, attachments, and reporting soon, Supabase is the stronger long-term data layer.

- Better built-in auth and row-level security
- Better admin tooling for records
- Easier real-time workflows later

For the current scope, Render + Postgres is still the simplest deployment path.

## Current Workflow Blocker

The local repository is initialized, but GitHub push is blocked because `gh` is not authenticated on this machine yet.

Use either:

```bash
gh auth login
```

or provide the full repository URL and owner so the remote can be configured directly.
