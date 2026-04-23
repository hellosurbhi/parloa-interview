# par.loa — URL Shortener

Built during (and after) a live systems design interview with Parloa.

Live: https://parloa-interview.vercel.app  
GitHub: https://github.com/hellosurbhi/parloa-interview

## What it does

- Shorten any HTTPS URL to a base62 short code (e.g. `par.loa/3Xk9m`)
- Custom aliases (3–30 chars, alphanumeric + hyphens)
- Optional expiry (1h / 24h / 7d / 30d) — expired links return 410 Gone
- GitHub OAuth via NextAuth v4 — only signed-in users can shorten and delete
- Owner-only delete with Redis cleanup

## Tech stack

- **Next.js 14** App Router, TypeScript, Tailwind CSS
- **Upstash Redis** — URL storage, atomic INCR counter, sorted sets for per-user lists
- **NextAuth v4** — GitHub OAuth, JWT sessions
- Deployed on **Vercel** via push-to-deploy

## Short code generation

No UUIDs. Each short code is a base62 encoding of an atomic Redis INCR counter:

```
INCR url:id_counter  →  100042
base62(100042)       →  "q8G"
```

Redis is single-threaded so two concurrent requests always get different counters — no coordination layer needed.

## Architecture

```
src/
  app/
    page.tsx                         # Home page
    not-found.tsx                    # Custom 404
    [shortCode]/route.ts             # 302 redirect with expiry check
    api/urls/route.ts                # POST (shorten), GET (list)
    api/urls/[shortCode]/route.ts    # DELETE (owner only)
    api/auth/[...nextauth]/route.ts  # NextAuth handler
  components/
    UrlShortener.tsx   # Orchestrator (state + layout)
    UrlForm.tsx        # URL creation form
    UrlList.tsx        # URL table with copy, delete, expiry badges
    AuthPrompt.tsx     # Sign-in CTA
    UserMenu.tsx       # Login/logout with avatar
    Providers.tsx      # SessionProvider wrapper
  lib/
    env.ts             # Env var validation at startup
    auth.ts            # NextAuth config (GitHub OAuth, JWT)
    auth-helpers.ts    # requireAuth() guard
    redis.ts           # Upstash Redis singleton
    url-store.ts       # Redis-backed URL CRUD
    utils.ts           # base62 encoding, short code generation
    errors.ts          # ApiError class
    types.ts           # Shared TypeScript interfaces
```

## API

All responses use a consistent envelope.

### `POST /api/urls`

Create a short URL. Requires auth.

```json
{ "url": "https://example.com", "custom_alias": "my-link", "expires_in": 86400 }
```

Returns `201` with `{ data: { short_code, original_url, short_url, created_at, expires_at } }`.

### `GET /api/urls`

List the signed-in user's URLs. Returns `200` with `{ data: ShortenedUrl[] }`.

### `DELETE /api/urls/:shortCode`

Delete a URL. Owner only. Returns `204`.

### `GET /:shortCode`

Redirect to original URL. Returns `302`, or `404`/`410` if missing/expired.

## Error envelope

```ts
{ error: { code: string, message: string } }
```

Status codes: `201` create · `200` read · `204` delete · `400` bad input · `401` unauthenticated · `403` forbidden · `404` not found · `409` alias taken · `410` expired · `503` Redis unavailable

## Running locally

```bash
cp .env.example .env.local
# fill in GITHUB_ID, GITHUB_SECRET, NEXTAUTH_SECRET, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
npm install
npm run dev
```

Open http://localhost:3000
