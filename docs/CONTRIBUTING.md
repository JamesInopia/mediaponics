# Contributing to Mediaponics

Thanks for helping out. Mediaponics is a search site for freely licensed media. It stores metadata only and links to the source for every asset, so **license correctness matters more than volume**. Contributions that keep the data accurate are the most valuable ones.

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- Fix a bug or improve the UI
- Add a new source adapter (see [Adding a source](#adding-a-source))
- Fix a license mapping or a wrongly listed asset
- Add tests (the UI and API routes have none yet)
- Improve the documentation

If you are unsure where to start, open an issue and ask.

## Reporting problems

- **Bugs and feature ideas:** use the [issue templates](https://github.com/JamesInopia/mediaponics/issues/new/choose).
- **A wrong license, a dead link, or content that should not be listed:** open an issue using the license issue template. Include the asset's link on Mediaponics and, if you have it, a link to the source page that shows the correct information.
- **Copyright or takedown requests:** open an issue with the asset's link, a link to the original work, and the reason for removal.

## Getting set up

Follow **Getting started** in the [README](README.md). In short:

1. Fork the repository and clone your fork.
2. Run `npm install` (Node.js 22).
3. Copy `.env.example` to `.env` and fill in the values. Never commit `.env`.
4. Run `npm run db:migrate`, then `npm run ingest -- --limit 100` to load some data.
5. Run `npm run dev` and open <http://localhost:3000>.

## Workflow

1. **Create a branch** from `master`. Use a short descriptive name with a prefix, for example `feature/new-adapter`, `fix/license-mapping`, or `docs/readme-update`.
2. **Make your change.** Keep each pull request focused on one thing.
3. **Write clear commits** in the Conventional Commits style: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
4. **Run the checks** (below) and fix anything that fails.
5. **Update the docs** if your change affects them (below).
6. **Open a pull request** using the [pull request template](.github/PULL_REQUEST_TEMPLATE.md). Describe what changed and why, and how you tested it.

## Checks before you open a pull request

```bash
npm run test:ingest   # unit tests for ingestion
npm run lint          # ESLint
npx tsc --noEmit      # type check
npm run build         # production build
```

The automated tests cover **ingestion only**. For changes to the UI or API routes, check them by hand and describe in your pull request how you did it (which pages, which filters, what you expected to see). Adding tests for those areas is very welcome.

## Adding a source

New sources are added as adapters in `ingestion/adapters/`. Wikimedia Commons is the existing example, so read it first.

An adapter fetches records from a source and normalises them to the shape in `lib/api-types.ts`. Before you start:

1. **Read the source's terms and API rules.** Check rate limits, attribution requirements, and whether you may store its metadata. Open an issue if you are unsure.
2. **Never guess a license.** Map the source's license names in `ingestion/licenses.ts` to the four IDs the site uses (`cc0`, `cc-by`, `cc-by-sa`, `non-commercial`). If a record's license is missing, unmapped, or restricted, **skip it and log it**. Do not default it to something permissive.
3. **Do not copy media.** Store only metadata and links that point to the source's own servers.
4. **Be polite to the source.** Send the `INGEST_USER_AGENT`, keep request limits low, and retry on `429` and `maxlag`.
5. **Add tests** with fake `fetch` responses, so they need no database or network. Cover license mapping, normalisation, and skipped records.
6. **Document the source.** Add it to the README's source list and the About page.

## Fixing a license mapping

1. Find the source's exact license name in the skip log or the record.
2. Confirm on the source what the license really is. Include a link in your pull request.
3. Update `ingestion/licenses.ts` and add a test case for the new mapping.

If the license is restrictive or unclear, leave it unmapped so those records keep being skipped.

## Changing the database schema

1. Edit `db/schema.ts`.
2. Run `npm run db:generate` to create a migration in `drizzle/`.
3. Run `npm run db:migrate` to apply it.
4. Commit the schema change and the generated migration together.

Do not edit generated migrations by hand.

## Updating the docs

- Update the [README](README.md) if you change setup steps, environment variables, scripts, the API, or the project structure.
- Add an entry under **Unreleased** in [CHANGELOG.md](CHANGELOG.md), in the [Keep a Changelog](https://keepachangelog.com/) format.
- If you change an API response or parameter, update `lib/api-types.ts` and the API section of the README.

## Code style

- TypeScript throughout. Avoid `any`.
- Run `npm run lint` and follow what it reports.
- Match the existing style in the file you are editing.
- Keep components small and reuse the shared helpers in `lib/`.

## Review

A maintainer will review your pull request. Small, focused pull requests get reviewed faster. Be ready to answer questions or make changes, and please be patient, since this is a volunteer project.

## License

By contributing, you agree that your contributions are released under the project's [MIT License](LICENSE). This covers the code only. Assets listed on the site belong to their creators and are licensed by their sources.
