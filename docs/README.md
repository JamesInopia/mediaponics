# Mediaponics

**Every asset. Every license. One search.**

Mediaponics is a search site for freely licensed media: images, vectors, GIFs, music, sound effects and stock footage. It collects metadata (title, creator, license, preview link, source link) from open sources and lets you search and filter by type and license in one place.

Mediaponics **does not host any media files**. Every preview and download link points back to the source site, which remains the authority on the license. The database stores metadata only.

> **Disclaimer:** Mediaponics is informational only. Always check the license on the source page before using an asset.

**Current version:** 0.1.1 (pre-1.0, see [Project progress](#project-progress)) · **License:** [MIT](LICENSE) · **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## Table of contents

- [Features](#features)
- [System architecture](#system-architecture)
- [Impact: how we use the technology](#impact-how-we-use-the-technology)
- [Getting started](#getting-started)
- [Running tests and checks](#running-tests-and-checks)
- [Project structure](#project-structure)
- [API](#api)
- [Project progress](#project-progress)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Search across all assets, or browse by type (Images, Vectors, GIFs, Music, Sound Effects, Stock Footage).
- Filter by license (CC0, CC BY, CC BY-SA, CC BY-NC), date added, and sort order.
- Detail panel with creator, license explanation, and a "Go to source" link. Audio assets have a short in-page preview.
- Shareable URLs: search, filters, and the open asset live in the query string.
- Automated ingestion from Wikimedia Commons, with license checks and flagging of records whose source page is gone.
- Public JSON API under `/api/v1` and a weekly public data snapshot.

Only **Wikimedia Commons** is supported as a source so far. More sources are welcome, see [CONTRIBUTING.md](CONTRIBUTING.md).

## System architecture

![Mediaponics high-level architecture](/public/architecture.jpg)

The system has two halves that meet at the database.

**Web app (Next.js, deployed on Vercel)**

1. **Pages and components** (`app/`, `components/`): search, filters, asset cards, and the details panel.
2. **Client data layer** (`lib/api.ts`, `lib/use-assets.ts`): SWR hooks that fetch from the API.
3. **API routes** (`app/api/v1/`): validate input, apply the rate limit, set cache headers, and return JSON.
4. **Query layer** (`lib/asset-queries.ts`, `db/`): Drizzle ORM queries against Postgres, including full-text search.

**Ingestion pipeline (`ingestion/`, run by GitHub Actions)**

1. **Source adapters** (`ingestion/adapters/`): fetch records from a source and normalise them. Wikimedia Commons is the only adapter so far.
2. **Checks**: license mapping (`ingestion/licenses.ts`), content hashing, and skip logs. A record whose license is missing, unmapped or restricted is skipped, never guessed.
3. **Upsert**: insert or update metadata in the database.
4. **Revalidation and snapshot** (not shown in the diagram): stale records are re-fetched, records whose source page is gone are flagged after repeated failed checks, and a weekly snapshot is published (see [Scheduled jobs](#scheduled-jobs)).

**Data layer:** Supabase (PostgreSQL), metadata only, no media files. The web app reads through the transaction pooler (`DATABASE_URL`); migrations and ingestion use the session pooler (`DIRECT_URL`).

**Users, sources and contributors**

- A user searches on Mediaponics, sees thumbnails and previews loaded from the source, and follows "Go to source" to download the file and read its full license.
- Contributors add new source adapters and fix license issues in the ingestion pipeline.

## Impact: how we use the technology

| Technology | How it is used here |
| --- | --- |
| **Next.js 16 (App Router) and React 19** | Server-rendered shell with a client-side content browser. Route handlers provide the JSON API in the same project, so one deployment serves both the UI and the API. |
| **Vercel** | Hosts the app. API responses send `Cache-Control` headers (`s-maxage` plus `stale-while-revalidate`) so the CDN serves repeat requests without touching the database. Cache windows are defined in `lib/http.ts`. |
| **Supabase (PostgreSQL)** | Stores metadata only. A generated `tsvector` column with a GIN index powers weighted full-text search (title, then creator, then tags). The transaction pooler suits serverless; the session pooler is used for migrations and long ingestion runs. |
| **Drizzle ORM and drizzle-kit** | Typed queries and SQL migrations kept in `drizzle/`. Enums for asset type and license keep invalid values out of the database. |
| **SWR** | Client-side caching, pagination ("load more"), and retry handling for the content browser. |
| **Zod** | Validates and clamps every query parameter on the API (page, limit, type, sort, query length). Bad input falls back to defaults instead of erroring. |
| **Upstash Redis and Ratelimit** | A per-IP sliding-window limit (60 requests per minute) that works across serverless instances. It fails open: if Redis is down or not configured, requests are allowed. |
| **GitHub Actions** | Runs the daily ingestion and revalidation and the weekly data snapshot, so the site stays current without a server to maintain. |
| **Tailwind CSS 4 and lucide-react** | Styling and icons. |
| **TypeScript, ESLint, `node:test` and tsx** | Type safety across the app and ingestion scripts, linting, and unit tests for the ingestion logic. |

Design choices that follow from the platform: serverless-friendly database access (`prepare: false`, pooled connections), license correctness over volume (anything uncertain is skipped and logged), and politeness to sources (a required `INGEST_USER_AGENT`, request limits, retry on `maxlag` and `429`).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 (the version CI uses) and npm
- Git
- A PostgreSQL database. The project is built for [Supabase](https://supabase.com/), and a free project works.
- Optional: an [Upstash Redis](https://upstash.com/) database for rate limiting. Without it, rate limiting is simply off.

### Run the app locally

1. **Clone and install**

   ```bash
   git clone https://github.com/JamesInopia/mediaponics.git
   cd mediaponics
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   | Variable | Required | Purpose |
   | --- | --- | --- |
   | `DATABASE_URL` | Yes | Transaction pooler connection string (port 6543). Used by the site and API. |
   | `DIRECT_URL` | Yes | Session pooler connection string (port 5432). Used for migrations and ingestion. |
   | `INGEST_USER_AGENT` | For ingestion | App name and version plus a contact URL or email. Wikimedia requires it. |
   | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | No | Enables the API rate limit. |

   Never commit `.env`.

3. **Create the database tables**

   ```bash
   npm run db:migrate
   ```

4. **Load some data** (the site is empty until you do)

   ```bash
   npm run ingest -- --limit 100
   ```

   Useful flags: `--dry-run` (fetch and report without writing), `--audio-only`, `--category <name>` (repeatable), `--max-requests <n>`.

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

### Scheduled jobs

Two GitHub Actions workflows in `.github/workflows/` keep the data fresh. They need the repository secrets `DIRECT_URL` and `INGEST_USER_AGENT`.

| Workflow | Schedule (UTC) | What it does |
| --- | --- | --- |
| `ingest` | Daily, 03:17 | Runs `npm run ingest:ci`, then `npm run revalidate:ci` (refreshes stale records, flags records whose source page is gone). |
| `snapshot` | Weekly, Sunday 04:43 | Runs `npm run snapshot:ci` and uploads `assets.jsonl.gz` and `manifest.json` to the rolling `data-latest` release. |

Both can also be started by hand from the Actions tab.

### Change the database schema

1. Edit `db/schema.ts`.
2. Run `npm run db:generate` to create a migration in `drizzle/`.
3. Run `npm run db:migrate` to apply it.
4. Commit the schema change and the generated migration together.

### Deploy

The app deploys to Vercel as a standard Next.js project. Set `DATABASE_URL` (and optionally the Upstash variables) in the Vercel project settings.

## Running tests and checks

```bash
npm run test:ingest   # unit tests for ingestion (license mapping, normalisation, link checks, fetch retry logic)
npm run lint          # ESLint
npx tsc --noEmit      # type check
npm run build         # production build
```

The automated tests currently cover the **ingestion pipeline** only. They use fake `fetch` responses, so they need no database or network. The UI and API routes have no automated tests yet, so please check those changes by hand and describe how in your pull request. Adding tests is a welcome contribution.

## Project structure

```text
app/                  Pages (home, content, about, FAQ, licenses) and API routes (app/api/v1)
components/           UI components
lib/                  Shared types, API client, SWR hooks, query layer, rate limit, cache helpers
db/                   Drizzle schema and database clients
drizzle/              Generated SQL migrations
ingestion/            Source adapters, license mapping, upsert, revalidation, snapshot, tests
.github/workflows/    Scheduled ingestion and snapshot jobs
docs/                 Architecture diagram
```

## API

Base path: `/api/v1`. All responses are JSON and cached at the CDN (see `lib/http.ts`). Every endpoint is rate limited per IP when Upstash is configured.

| Endpoint | Description |
| --- | --- |
| `GET /api/v1/assets` | Without `type`, returns assets grouped by type (up to 12 per group, plus totals). With `type`, returns a paginated list. |
| `GET /api/v1/assets/{id}` | Returns one asset by its UUID, or a `404` error. |
| `GET /api/v1/status` | Record counts and last ingestion and revalidation times per source. |

Query parameters for `GET /api/v1/assets`:

| Parameter | Values |
| --- | --- |
| `q` | Search text (trimmed to 100 characters). |
| `type` | `Images`, `Vectors`, `GIFs`, `Music`, `Sound Effects`, `Stock Footage` |
| `license` | Comma-separated: `cc0`, `cc-by`, `cc-by-sa`, `non-commercial` |
| `added` | `any`, `week`, `month`, `year` |
| `sort` | `relevance`, `newest`, `oldest`, `title` |
| `page`, `limit` | Defaults to page 1 and 24 per page; `limit` is capped at 60. |

Errors use the shape `{ "error": { "code": "not_found" | "rate_limited" | "internal_error", "message": "..." } }`. The TypeScript contract lives in `lib/api-types.ts`.

## Project progress

- **Versioning:** Mediaponics follows [Semantic Versioning](https://semver.org/). While the major version is `0`, minor versions (`0.x.0`) may include breaking changes and patch versions (`0.x.y`) are fixes and documentation. The current version is in `package.json`.
- **Changelog:** every notable change is recorded in [CHANGELOG.md](CHANGELOG.md), in the [Keep a Changelog](https://keepachangelog.com/) format.
- **Development history:** work is done on feature branches (for example `feature/frontend-and-content`, `feature/data-layer`, `feature/ingestion-scale`) and merged into `master`. Commits follow the Conventional Commits style (`feat:`, `fix:`, `refactor:`).
- **Specifications:** the project does not use a spec-driven framework such as OpenSpec or Kiro. The written contracts are the API section above, `lib/api-types.ts`, and the database schema in `db/schema.ts` with its migrations in `drizzle/`.

## Contributing

Contributions are welcome: bug fixes, new source adapters, license-mapping fixes, tests, and documentation.

- Read [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, how to run the project and tests, and how to update the docs.
- Report bugs and suggest features with the [issue templates](https://github.com/JamesInopia/mediaponics/issues/new/choose).
- Open pull requests using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md).
- By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Mediaponics' source code is released under the [MIT License](LICENSE).

This applies to the code only. The assets listed on the site belong to their creators and are licensed by their sources. Mediaponics only links to them.
