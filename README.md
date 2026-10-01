# Lexora — Global Legal Workspace

Lexora is a portfolio frontend for international legal teams and their clients. Its central entity is a **Matter**: a legal engagement connecting a client, jurisdiction, team, documents, tasks, messages and activity.

This is an interactive frontend prototype, not a production legal service. All people, organizations and records are fictional. There is no backend, authentication, database, file storage, realtime service or AI integration.

## Run locally

Use Node.js 22 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000 for the public product website, or `/overview` for the workspace. Production preview:

```sh
npm run build
npm run start
```

## Product experience

- Public homepage with the Lexora wordmark, product positioning, platform overview and an entry into the demo.
- Overview with active matters, review queues, upcoming deadlines, tasks and recent activity.
- Matters with search, status/practice/jurisdiction/counsel filters and sorting.
- Validated matter creation and details with Overview, Documents, Tasks, Messages and Activity tabs.
- Client profiles, document metadata and explicitly labeled browser-generated demo downloads.
- Task status updates, matter conversations, deadline agenda, factual workspace analytics and legal team directory.
- Global search, timezone preferences, demo identities, error simulation and reset controls.
- Responsive navigation and mobile table cards; native dialogs and keyboard-operable tabs.

Workspace routes: `/overview`, `/matters`, `/matters/new`, `/matters/[id]`, `/clients`, `/clients/[id]`, `/documents`, `/tasks`, `/messages`, `/calendar`, `/analytics`, `/team`, `/settings`, `/help`, `/search`.

Old `/requests` routes redirect to their `/matters` equivalents. The public homepage is `/`.

## Architecture

Next.js App Router, React, TypeScript, SCSS Modules, TanStack Query, Zod and Lucide icons. No new state manager, UI framework or Tailwind was introduced.

```text
src/app/                    Route components, public website and layouts
src/components/matters/     Matter list, form, details and conversations
src/components/workspace/   Connected workspace sections
src/components/             Shell, providers, dialogs and shared UI styles
src/lib/domain.ts           Entities and Zod input schemas
src/lib/fixtures.ts         Coherent international demo dataset
src/lib/policy.ts           Centralized demo capabilities and visibility
src/lib/api/contracts.ts    WorkspaceApi contract and typed errors
src/lib/api/mock.ts         Asynchronous in-memory adapter
src/lib/api.ts              Adapter selection boundary
src/lib/queries.ts          Query keys, workspace loading and format hook
src/lib/presentation.ts     Domain labels and activity presentation
src/i18n/                   Reusable formatting and future locale foundations
```

Entities carry organization context. Jurisdiction, country, locale, timezone and currency remain independent concepts. Jurisdictions are reference metadata, not encoded legal rules. The demo contains one organization, six clients and seven related matters with documents, tasks, messages and structured activities.

Components use `WorkspaceApi` through the facade and Query cache. To connect Express later, implement the contract with an HTTP adapter and select it in `src/lib/api.ts`. Server endpoints must own validation, authorization, organization isolation, persistence and audit events. A future API may split the current workspace snapshot into paginated resource endpoints without changing domain presentation components.

The mock adapter validates inputs and associations, scopes client visibility and records structured events. These checks demonstrate behavior; they are **not security**. The browser controls the demo identity. No real RBAC or tenant isolation is implemented.

## Demo flows

1. **New engagement:** open New Matter, provide a client, practice area, jurisdiction, target date and description. Create the matter, send a message, change its status and inspect Activity.
2. **Client collaboration:** select Client in Settings or navigation. Open Northstar Acquisition, inspect its demo documents and send a message. Switch to Lawyer to reply manually and update the status. There are no simulated lawyer auto-replies.

Help contains controls to fail the next API call and reset demo data. Changes exist in the memory of the current tab and disappear on reload. Client-side navigation preserves them. Downloads contain clearly labeled demonstration text, not genuine legal documents; uploads are not implemented.

## Language and formatting

This redesign stage is English-only. The EN control explains the planned language support; it does not pretend to switch languages. Old locale cookies do not affect the interface.

Generic catalogs for English, Russian, Spanish, French and Italian, locale negotiation helpers and `Intl` formatters were preserved as foundations for phase 2. They do not constitute full product localization. Domain labels are centralized in `presentation.ts`; remaining product copy will be extracted during that phase.

Dates and numbers use shared `Intl` formatters. Date-only deadlines preserve their calendar date using UTC; timestamps use the independently selected display timezone. Preferences are limited to the current tab. Currency formatting accepts an explicit currency; billing is not implemented.

## Verification

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
npm run test:e2e
```

`npm run format` applies Prettier. VS Code formatter settings are included.

Vitest covers API validation, scope, changes, messages, structured activity, recovery, locale foundations and date/timezone formatting. Playwright covers public homepage navigation and core workspace flows on desktop Chromium and mobile Chromium. It starts a production server at `127.0.0.1:3107`, so build first and keep that port free. Install the browser if necessary with `npx playwright install chromium`. Failure traces and screenshots are written to `test-results/`.

## Limitations

No durable data, real users, permissions, tenant boundaries, uploads, notifications delivery or backend audit log. Analytics summarize the current visible demo data only. Calendar is an agenda, not calendar integration. The interface does not provide legal advice or jurisdiction-specific legal conclusions. The demo uses fixed fictional dates in 2026, so upcoming deadline counts depend on the current date. Public pages have no search-indexing claim; the prototype is marked `noindex`.

## Roadmap

1. Global product redesign and public product homepage.
2. Full internationalization: English, Russian, Spanish, French and Italian.
3. Node.js + Express REST API.
4. PostgreSQL and migrations.
5. Authentication and RBAC: Client, Lawyer, Admin; expanded organization roles as needed.
6. Multi-tenancy with server-enforced organization isolation.
7. Real document uploads and storage.
8. Notifications and realtime.
9. Backend audit log and background jobs.
10. AI-assisted document review, always subject to professional review.
11. Docker, CI/CD and production deployment.
