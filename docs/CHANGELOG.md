# Changelog

All notable changes to Mediaponics are recorded here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project follows [Semantic Versioning](https://semver.org/). While the major version is `0`, minor versions may include breaking changes.

## [Unreleased]

## [0.1.1] - 2026-10-24

### Fixed

- Opening the asset details panel could crash the content page with "This page couldn't load", and reloading did not recover because the URL still contained `?asset=`. The cause was `GET /api/v1/assets/{id}`, which was a copy of the list route and returned the grouped list instead of a single asset. It now returns the requested asset, or a `404` error for an unknown or removed id.

### Changed

- Rewrote `README.md` to match the actual stack (Next.js, Supabase, Drizzle, Upstash, GitHub Actions). It now covers the architecture diagram, how the project uses its technology, setup, environment variables, tests, the API, versioning, and contributing.

### Added

- `LICENSE` (MIT).
- `CODE_OF_CONDUCT.md` and `CONTRIBUTING.md`.
- Issue templates (bug report, feature request, license issue) and a pull request template.
- High-level architecture diagram in `docs/architecture.png`.
- This changelog.

## [0.1.0] - 2026-10-23

Initial deployment on Vercel.

### Added

- Website with Home, Content, About, FAQ and Licenses pages.
- Content browser with search, type tabs, license filter, date filter, sorting, shareable URLs, and an asset details panel with audio previews.
- Data layer on Supabase (PostgreSQL) using Drizzle ORM, with weighted full-text search and SQL migrations.
- Ingestion pipeline with a Wikimedia Commons adapter, license mapping that skips anything uncertain, content hashing, and skip logs.
- Public JSON API under `/api/v1` (`/assets`, `/assets/{id}`, `/status`) with CDN cache headers.
- Per-IP rate limiting with Upstash Redis (fails open).
- Revalidation of stale records and link checking, with removal flags after repeated failed checks.
- Scheduled GitHub Actions: daily ingestion and revalidation, weekly public data snapshot.
- Unit tests for the ingestion pipeline (`npm run test:ingest`).

[Unreleased]: https://github.com/JamesInopia/mediaponics/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/JamesInopia/mediaponics/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/JamesInopia/mediaponics/releases/tag/v0.1.0
