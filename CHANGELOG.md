# Changelog

## Security hardening

### What changed
- Added security headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Fixed NULL user_id bypass allowing any user to delete unowned URLs
- Added authentication to all notes endpoints (POST, GET, DELETE)
- Added 10KB content limit on notes
- Fixed alias race condition via UNIQUE constraint catch instead of TOCTOU check
- Created `.env.example` with placeholder values

### Files affected
- `next.config.mjs` — security headers
- `src/app/api/urls/[shortCode]/route.ts` — NULL user_id fix
- `src/app/api/notes/route.ts` — auth + content limit
- `src/app/api/notes/[id]/route.ts` — auth + error envelope
- `src/app/api/urls/route.ts` — race condition fix
- `.env.example` — env var template

## URL shortener with full system design

### What changed
- Built URL shortener ("par.loa") with counter-based base62 short code generation
- Added Upstash Redis caching layer with TTL-aware cache for redirect lookups
- Added NextAuth v4 with GitHub OAuth and JWT sessions
- Added custom alias support (3-30 chars, alphanumeric + hyphens)
- Added URL expiration (1h, 24h, 7d, 30d options) with 410 Gone on expired
- Added DELETE endpoint with owner-only authorization and cache invalidation
- Changed redirect from 301 to 302 to support analytics and link updates
- Replaced localStorage with API-backed URL list
- Redesigned URL list as table with expiry badges, copy, and delete
- Added SQLite counter fallback when Redis is unavailable

### Files affected
- `src/lib/redis.ts` — Upstash Redis client singleton
- `src/lib/auth.ts` — NextAuth config with GitHub OAuth
- `src/lib/auth-helpers.ts` — requireAuth helper
- `src/lib/utils.ts` — base62 encoding + Redis/SQLite counter
- `src/lib/db.ts` — urls table with expires_at, user_id columns
- `src/lib/types.ts` — ShortenedUrl, CreateUrlRequest types
- `src/lib/errors.ts` — ApiError class
- `src/app/api/urls/route.ts` — POST + GET with auth, alias, expiry
- `src/app/api/urls/[shortCode]/route.ts` — DELETE with auth
- `src/app/[shortCode]/route.ts` — Redis-cached 302 redirect with expiry
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `src/components/UrlShortener.tsx` — auth-aware UI with form + table
- `src/components/UserMenu.tsx` — login/logout with avatar
- `src/components/Providers.tsx` — SessionProvider wrapper
- `src/app/page.tsx` — page with UserMenu + UrlShortener
- `src/app/layout.tsx` — wrapped with Providers
- `src/types/next-auth.d.ts` — session type augmentation

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
