# Changelog

## Scaffold Next.js 14 notes app

Initial project scaffold with Next.js 14 App Router, TypeScript, and Tailwind CSS.

### What changed
- Replaced Express/uuid starter with Next.js 14 (App Router, TypeScript, Tailwind)
- Added `better-sqlite3` for SQLite storage and `nanoid@3` for ID generation
- Created `src/lib/db.ts` — SQLite helper with `notes` table (id, content, created_at, expires_at) and expires_at index
- Created `src/lib/utils.ts` — `generateId()` wrapper around nanoid(10)
- Created `src/app/api/notes/route.ts` — POST handler for creating notes
- Created `src/app/api/notes/[id]/route.ts` — GET (with expiry check) and DELETE handlers
- Created `src/app/page.tsx` — minimal client UI for creating and fetching notes
- Added `plan.md`, `bugs.md`, `enhancements.md` tracking files
- Added `data.db` to `.gitignore`

### Files affected
- `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs` — project config
- `src/lib/db.ts`, `src/lib/utils.ts` — shared utilities
- `src/app/api/notes/route.ts`, `src/app/api/notes/[id]/route.ts` — API routes
- `src/app/page.tsx` — home page UI
- `plan.md`, `bugs.md`, `enhancements.md` — tracking files
- `.gitignore` — added sqlite files
