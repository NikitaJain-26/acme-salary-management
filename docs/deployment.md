# Deployment

The frontend is hosted on Vercel. The Express API runs as a Railway service with a
persistent volume for SQLite.

## Railway API

1. Create a Railway service from this GitHub repository and set its root directory to
   `server`.
2. Attach a persistent volume mounted at `/data`.
3. Set `DATABASE_URL` to `file:/data/salary.db`.
4. Set the health check path to `/api/health`.
5. Deploy the service and generate a public domain.

The `build` script generates the Prisma client and compiles the API. The `start` script
applies pending Prisma migrations before starting the server. Railway supplies `PORT`.

## Vercel frontend

1. Import the same repository into Vercel and set the root directory to `client`.
2. Use the Vite framework preset, build command `npm run build`, and output directory
   `dist`.
3. Set `VITE_API_BASE_URL` to the Railway public URL followed by `/api`, for example
   `https://your-api.up.railway.app/api`.
4. Deploy and note the Vercel production URL.

Set Railway's `FRONTEND_ORIGIN` to that exact Vercel production origin (scheme and
hostname, without a path), then redeploy the API. The API also allows the local Vite
origin by default for development.

The production SQLite database starts empty; the local development database is not
copied or seeded during deployment.
