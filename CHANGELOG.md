# Changelog

## Accessibility improvements (WCAG AA)

### What changed
- Added descriptive alt text and explicit width/height to avatar image
- Added focus ring on sign-out button
- Added visible labels to all form inputs
- Added focus rings and 48px touch targets to interactive elements
- Fixed nav and footer text contrast to meet WCAG AA (4.5:1 minimum)

### Files affected
- `src/components/UserMenu.tsx` — avatar alt, focus ring
- `src/components/UrlForm.tsx` — form labels, focus rings
- `src/app/page.tsx` / `src/app/layout.tsx` — contrast fixes

## Design polish

### What changed
- Removed duplicate sign-in link from nav
- Left-aligned hero text, bumped font weight, added accent underline
- Show page content immediately during session loading (no layout shift)

### Files affected
- `src/app/page.tsx` — hero layout, loading behaviour
- `src/components/UserMenu.tsx` — removed duplicate sign-in

## Migrate data layer from SQLite to Upstash Redis

### What changed
- Built Redis-backed url-store module (createUrl, getUrlForRedirect, listUserUrls, deleteUrl)
- Migrated POST/GET /api/urls, DELETE /api/urls/:shortCode, and /:shortCode redirect to Redis
- Removed SQLite counter fallback — Redis INCR is the only ID source
- Removed "stored in SQLite" copy from footer

### Files affected
- `src/lib/url-store.ts` — new Redis CRUD module
- `src/app/api/urls/route.ts` — uses url-store
- `src/app/api/urls/[shortCode]/route.ts` — uses url-store
- `src/app/[shortCode]/route.ts` — uses url-store for redirect
- `src/lib/utils.ts` — removed SQLite fallback
- `src/app/page.tsx` — removed SQLite footer note

## Ship-it production hardening

### What changed
- Replaced Vercel default favicon with custom SVG lettermark
- Added Open Graph and Twitter card metadata for social sharing previews
- Created branded 404 page matching the app's design language
- Fixed silent error catches in UrlShortener — network/clipboard failures now show user-facing messages
- Added runtime validation for Redis JSON parsing (replaced unsafe type casts)
- Split UrlShortener (301 lines) into AuthPrompt, UrlForm, UrlList sub-components
- Added env var validation at startup — missing GITHUB_ID/SECRET throws a clear error instead of cryptic crash
- Removed dead code: db.ts (SQLite), unused generateId, better-sqlite3 and nanoid dependencies

### Files affected
- `src/app/icon.svg` — new custom favicon
- `src/app/not-found.tsx` — new branded 404 page
- `src/app/layout.tsx` — OG + Twitter metadata
- `src/components/AuthPrompt.tsx` — extracted sign-in prompt
- `src/components/UrlForm.tsx` — extracted URL creation form
- `src/components/UrlList.tsx` — extracted URL table
- `src/components/UrlShortener.tsx` — simplified orchestrator
- `src/lib/env.ts` — env var validation
- `src/lib/auth.ts` — uses env.ts for GitHub credentials
- `src/lib/url-store.ts` — parseStoredUrl validation function
- `src/lib/utils.ts` — removed unused generateId and nanoid import
- `package.json` — removed better-sqlite3, nanoid

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
