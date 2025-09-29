# Repository Guidelines
- **常に日本語で回答する**

## Project Structure & Module Organization
- `src/app`: App Router pages, layouts, and UI (e.g., `src/app/page.tsx`, `src/app/users/[id]`).
- `pages/api`: API routes (e.g., `pages/api/users.ts`) that call Supabase.
- `lib`: Shared utilities (e.g., `lib/supabaseClient.ts`).
- `public`: Static assets. `src/app/globals.css` for global styles.
- `e2e`: Playwright tests. Config in `playwright.config.ts`.

## Build, Test, and Development Commands
- `npm run dev`: Start Next.js dev server with Turbopack.
- `npm run build`: Create production build.
- `npm start`: Run production server.
- `npm run lint` / `npm run lint:fix`: Lint (and auto-fix) with ESLint.
- `npm run format` / `npm run format:check`: Format (or check) with Prettier.
- `npm run test:e2e` (`:ui`, `:headed`): Run Playwright tests.

## Coding Style & Naming Conventions
- Language: TypeScript, React, Next.js App Router. Tailwind CSS v4.
- Formatting (Prettier): 2 spaces, single quotes, no semicolons, print width 80.
- ESLint: no unused vars (error), avoid `any` (warn). React JSX rules enabled.
- Filenames: route segments in kebab-case (`users/add/page.tsx`), components in PascalCase, tests as `*.spec.ts`.
- Prefer `src/app` for new pages; keep API under `pages/api` until migrated.

## Testing Guidelines
- Framework: Playwright (`@playwright/test`). Tests live in `e2e/*.spec.ts`.
- Scope: Cover core flows—list, detail, add, edit, delete users.
- Run locally: `npm run dev` then `npm run test:e2e` (config auto-starts the server).
- Name tests descriptively; use Japanese UI labels consistently in selectors as in existing specs.

## Commit & Pull Request Guidelines
- Commit style observed: mix of Japanese messages and Conventional Commits (`feat:`, `chore:`, `fix:`). Prefer Conventional Commits when possible.
- PRs should include: summary, motivation, before/after notes, screenshots for UI, linked issues, and test plan.
- Pre-submit checklist: `npm run lint`, `npm run format:check`, `npm run build`, and `npm run test:e2e`.

## Security & Configuration Tips
- Required env vars (set in `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Never commit secrets. Verify env presence in local and CI. Example curl: `curl http://localhost:3000/api/users` after `npm run dev`.
- Supabase access is via `lib/supabaseClient.ts`; prefer this client in API code and avoid duplicating configuration.

