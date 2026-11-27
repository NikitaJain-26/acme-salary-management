# Deployment

The frontend is hosted on Vercel. The Express API runs as a Railway service with a
persistent volume for SQLite.

## Railway API

1. Create a Railway service from this GitHub repository and set its root directory to
   `server`.
2. Attach a persistent volume mounted at `/data`.
3. Set `DATABASE_URL` to `file:/data/salary.db`.
4. Set `FRONTEND_ORIGIN` to the Vercel production origin.
5. Before deploying authentication, set `INITIAL_ADMIN_EMAIL` and
   `INITIAL_ADMIN_PASSWORD` in Railway. The password must be at least 12 characters.
   The first deployment creates one Admin account if none exist; later restarts do not
   overwrite existing accounts.
6. Set the health check path to `/api/health`.
7. Deploy the service and generate a public domain.

The `build` script generates the Prisma client and compiles the API. The `start` script
applies pending Prisma migrations before starting the server. Railway supplies `PORT`.

## Vercel frontend

1. Import the same repository into Vercel and set the root directory to `client`.
2. Use the Vite framework preset, build command `npm run build`, and output directory
   `dist`.
3. Keep the API base path as `/api`. The Vercel rewrite proxies API requests to the
   Railway domain so secure session cookies remain same-origin in the browser.
4. Deploy and note the Vercel production URL.

The API also allows the local Vite origin by default for development.

A newly provisioned production SQLite database starts empty; the local development
database is not copied or seeded during deployment. Applying migrations preserves
existing employee and salary records. The demo seed script is separate and should
only be run when intentionally populating a database.

Administrators can create individual Admin or Viewer accounts from the HR accounts
page. Public registration is disabled. Viewers can read employee, salary, and
analytics data but cannot create employees, change salaries, or manage accounts.
