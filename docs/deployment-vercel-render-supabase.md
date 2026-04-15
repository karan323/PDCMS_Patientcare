# Vercel + Render + Supabase Deployment

This project is set up to deploy as:

- frontend on Vercel
- backend API on Render
- database on Supabase Postgres

## Architecture

- Vercel serves the static frontend build from `dist/`
- Render runs `src/server/index.js`
- The browser calls the Render API using `PDCMS_API_BASE_URL`
- The Render API connects to Supabase using `DATABASE_URL`

## What Changed In The Repo

- `vercel.json` deploys the frontend from `dist/`
- `scripts/build-frontend.js` creates `dist/` and injects `PDCMS_API_BASE_URL`
- `src/scripts/product/runtime-config.js` provides a local default config
- frontend API calls now use a runtime-configured base URL
- backend CORS is controlled by `CORS_ALLOWED_ORIGINS`
- backend SSL is controlled by `DATABASE_SSL` and `DATABASE_SSL_REJECT_UNAUTHORIZED`
- `render.yaml` now expects an external `DATABASE_URL`

## 1. Supabase Setup

1. Create a new Supabase project.
2. Wait until the database is ready.
3. In the Supabase dashboard, open `Connect`.
4. Copy the `Session pooler` connection string.

Use the session pooler string here because Render is a long-running Node service and the session pooler avoids the prepared-statement limitations of transaction pooling.

You will need:

- the full connection string for `DATABASE_URL`
- the database password you set in Supabase

Example format:

```text
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

## 2. Render Setup

1. Push this repo to GitHub.
2. In Render, create a new `Blueprint` deployment from the repo, or create a normal `Web Service`.
3. If you use the blueprint, Render will read `render.yaml`.
4. Set the following environment variables in Render:

```text
NODE_ENV=production
DATABASE_URL=<your Supabase session pooler connection string>
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
CORS_ALLOWED_ORIGINS=https://your-vercel-project.vercel.app
```

5. Deploy the service.
6. After deployment, note your Render backend URL, for example:

```text
https://pdcms-patientcare-api.onrender.com
```

## 3. Vercel Setup

1. Import the same GitHub repo into Vercel.
2. Set `Framework Preset` to `Other`.
3. Vercel should pick up `vercel.json`.
4. Add this environment variable in Vercel:

```text
PDCMS_API_BASE_URL=https://your-render-service.onrender.com
```

5. Deploy.

The frontend build writes that value into the generated runtime config, so the browser knows where to send API requests.

## 4. Finish CORS

After Vercel gives you the production URL:

1. Copy the exact Vercel origin.
2. Update Render `CORS_ALLOWED_ORIGINS` with that origin.
3. Redeploy the Render service if needed.

Example:

```text
CORS_ALLOWED_ORIGINS=https://pdcms-patients-care.vercel.app
```

If you later attach a custom frontend domain, add that domain too as a comma-separated list.

Example:

```text
CORS_ALLOWED_ORIGINS=https://pdcms.example.com,https://pdcms-patients-care.vercel.app
```

## 5. Local Development

If you want local development against files only:

```text
npm install
npm start
```

If you want local development against Supabase:

```text
DATABASE_URL=<your Supabase connection string>
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
npm start
```

If your frontend is served from a different local origin, also set:

```text
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 6. First Production Check

Verify these URLs after deployment:

- Vercel frontend loads successfully
- `https://your-render-service.onrender.com/api/health` returns JSON
- creating an admission from the frontend updates dashboard counts
- adding a workload item persists data and reloads correctly

Expected health payload:

```json
{
  "status": "ok",
  "storage": "postgres"
}
```

## Notes

- The backend creates its tables automatically on first startup.
- This app currently uses server-side Postgres access only. It does not use the Supabase JS client, Auth, or Storage yet.
- Vercel preview deployments use different URLs. If you want previews to call the backend, add each preview origin to `CORS_ALLOWED_ORIGINS` manually or temporarily test against production only.
