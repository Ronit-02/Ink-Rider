# Ink-Rider development guide

This guide covers local setup, MongoDB, Docker, environment variables, verification, and GitHub Actions. For the product overview, features, and user roles, see the [project README](README.md).

## Architecture

```text
React 18 + Vite on port 3000
          |
          | HTTP JSON and cookies
          v
Express 5 API on port 8000  --->  MongoDB
          |
          +---> optional Cloudinary, email, Stripe, and OpenAI providers

Notification worker  ---------->  MongoDB delivery queue
```

The API and notification worker use the same backend source, but they are separate processes. The worker is only needed for queued email or push delivery. In-app notifications and ordinary API development do not require it.

## Requirements

- Node.js 22 or newer
- npm
- MongoDB 7 locally, in Docker, on another trusted machine, or through MongoDB Atlas

## Local development

### 1. Create local environment files

PowerShell:

```powershell
Copy-Item Backend/.env.example Backend/.env
Copy-Item Frontend/.env.example Frontend/.env
```

Bash:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

Set a long random `JWT_SECRET` in `Backend/.env`. The defaults in the example files use `127.0.0.1` consistently because authentication cookies and CORS are easier to test when the frontend and backend use the same hostname style.

Do not commit either real `.env` file. The nested `Backend/.gitignore` and `Frontend/.gitignore` files ignore them. Commit the `.env.example` files because they contain names and safe placeholders only.

### 2. Start MongoDB

Choose one option.

If MongoDB is installed as a local service, start that service and keep:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ink-rider
```

If Docker is installed, run MongoDB in a persistent container:

```bash
docker run -d --name ink-rider-mongo -p 27017:27017 -v ink-rider-mongo-data:/data/db mongo:7
```

The application still uses the same local `MONGO_URI`. Stop and restart the database with:

```bash
docker stop ink-rider-mongo
docker start ink-rider-mongo
```

For MongoDB Atlas, create a cluster, database user, and network-access rule. Put the Atlas connection string in `Backend/.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/ink-rider?retryWrites=true&w=majority
```

Atlas is the safer choice when the API runs on another computer or hosting provider. Do not expose an unauthenticated local MongoDB port to the public internet. If MongoDB runs on another trusted machine on your LAN, bind it deliberately, enable authentication and firewall restrictions, then use that machine's private address in `MONGO_URI`.

Production should use Atlas or another replica-set deployment so MongoDB transactions are active. The standalone local setup is supported for development through a compatibility fallback.

### 3. Install dependencies

```bash
cd Backend
npm ci
cd ../Frontend
npm ci
```

### 4. Add demo data if needed

```bash
cd Backend
npm run seed:dev
```

The seed is safe to rerun and refuses to run in production. Demo accounts use the password in `SEED_PASSWORD`. See [context/test-fixtures.md](context/test-fixtures.md) for the account and feature map.

### 5. Start the application

Use two terminals:

```bash
cd Backend
npm run dev
```

```bash
cd Frontend
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). The API liveness check is [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health), and database readiness is [http://127.0.0.1:8000/readiness](http://127.0.0.1:8000/readiness).

`npm run dev` is the normal workflow in VS Code. Docker is optional for local development.

## Docker files

The repository has two root Dockerfiles and no Compose file.

### `dockerfile`

This is a multi-stage image definition. It builds the Vite frontend, installs the backend, copies `Frontend/dist` to `/app/public`, and starts `node server.js`.

It is not currently a complete frontend-plus-backend deployment. Express has static serving disabled and has no single-page-app fallback, so the copied frontend files are not served. The image now matches local/CI Node 22, uses lockfile-based installs, installs production-only backend dependencies, and runs as a non-root user. Treat the combined frontend-serving shape as unfinished deployment work, not the recommended way to run the whole product.

### `dockerfile.worker`

This builds the notification worker from `Backend/` with Node 22 and starts `node worker.js`. The worker continuously claims queued provider-delivery jobs from MongoDB. It needs the same database and provider environment variables as the API.

Example build commands:

```bash
docker build -f dockerfile -t ink-rider-api .
docker build -f dockerfile.worker -t ink-rider-worker .
```

Building an image is separate from running it. A production deployment also needs environment variables, network access to MongoDB, exposed API ports, persistent provider configuration, and separate frontend hosting until the main Dockerfile is repaired.

### Local development versus Docker

Use `npm run dev` for day-to-day coding. It gives Vite hot reload and backend restart through Nodemon. Use Docker when testing a deployment image or when your hosting platform expects containers. You do not need separate frontend and backend Docker containers just to work in VS Code.

For the current production shape, the cleanest split is:

- Build `Frontend/` and deploy `Frontend/dist` to a static host.
- Run the Express API as a Node service or a corrected API container.
- Run `dockerfile.worker` as a separate worker service if provider notifications are enabled.
- Use MongoDB Atlas or another secured replica-set MongoDB deployment.

## GitHub Actions CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs automatically for every push and pull request. It:

1. Starts a temporary MongoDB 7 service inside the GitHub runner.
2. Installs backend dependencies with `npm ci`.
3. Runs backend contract and database integration tests.
4. Seeds test data.
5. Installs frontend dependencies and Playwright Chromium.
6. Builds the frontend and runs the browser suite.
7. Runs the SEO crawl against temporary local services.
8. Uploads the Playwright report.

CI does not deploy the application, push Docker images, or use the root Dockerfiles. A green workflow means the checked-in code passed the automated verification on GitHub's runner.

## Verification

Backend contracts:

```bash
cd Backend
npm test
```

Frontend production build:

```bash
cd Frontend
npm run build
```

Database integration tests require a reachable MongoDB database:

```powershell
cd Backend
$env:RUN_DB_INTEGRATION = "true"
npm run test:integration
```

Use `RUN_DB_INTEGRATION=true npm run test:integration` in Bash.

Browser tests manage their own local API and Vite processes by default:

```bash
cd Frontend
npm run test:e2e
```

## Environment variables

The source of truth is [Backend/.env.example](Backend/.env.example) and [Frontend/.env.example](Frontend/.env.example).

- Backend variables may contain secrets and must stay server-side.
- Every frontend variable prefixed with `VITE_` is compiled into browser code and must be treated as public.
- `GOOGLE_CLIENT_ID` belongs to the backend. `VITE_GOOGLE_CLIENT_ID` belongs to the frontend. The frontend does not read an unprefixed `GOOGLE_CLIENT_ID`.
- Optional providers can remain blank. Their dependent endpoints report a clear configuration error while the rest of Ink-Rider continues to run.

Run this for a redacted backend provider report:

```bash
cd Backend
npm run providers:readiness
```

Add `-- --strict` only when the deployment is expected to have every optional provider configured.

## What should be committed

Commit these files:

- Application source, tests, lockfiles, Dockerfiles, and `.github/workflows/ci.yml`
- `Backend/.env.example` and `Frontend/.env.example`
- The complete `context/` directory
- Root documentation files

Do not commit:

- `Backend/.env` or `Frontend/.env`
- `node_modules/`, `Frontend/dist/`, Playwright reports, local logs, database files, or credentials

The `context/` directory should be pushed. It is the project's product, architecture, UI, testing, deployment, and progress record. Before pushing, scan it for accidental credentials or private personal data. The current context documents are intended to be version-controlled.

## Related engineering documentation

- [Frontend guide](Frontend/README.md)
- [Architecture](context/architecture.md)
- [Build plan](context/build-plan.md)
- [Code standards](context/code-standards.md)
- [UI tokens](context/ui-tokens.md), [UI rules](context/ui-rules.md), and [UI registry](context/ui-registry.md)
- [Library and provider rules](context/library-docs.md)
- [Development fixtures](context/test-fixtures.md)
- [Deployment research](context/deployment-research.md)
- [Progress tracker](context/progress-tracker.md)
