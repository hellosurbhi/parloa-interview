# CLAUDE.md

## Stack

Next.js 14 App Router, TypeScript, Tailwind, Upstash Redis. Deployed on Vercel via push-to-deploy.

## Architecture

```
src/
  app/
    page.tsx                     -- Home page
    not-found.tsx                -- Custom 404
    [shortCode]/route.ts         -- 302 redirect handler
    api/urls/route.ts            -- POST (create), GET (list)
    api/urls/[shortCode]/route.ts -- DELETE
    api/auth/[...nextauth]/route.ts -- NextAuth handler
  components/
    UrlShortener.tsx              -- Orchestrator (state + layout)
    UrlForm.tsx                   -- URL creation form
    UrlList.tsx                   -- URL table with actions
    AuthPrompt.tsx                -- Sign-in CTA
    UserMenu.tsx                  -- Login/logout with avatar
    Providers.tsx                 -- SessionProvider wrapper
  lib/
    env.ts                        -- Env var validation
    auth.ts                       -- NextAuth config (GitHub OAuth, JWT)
    auth-helpers.ts               -- requireAuth() guard
    redis.ts                      -- Upstash Redis singleton
    url-store.ts                  -- Redis-backed URL CRUD
    utils.ts                      -- base62 encoding, short code generation
    errors.ts                     -- ApiError class
    types.ts                      -- Shared TypeScript interfaces
```

## Conventions

### API Response Contract

All endpoints return a consistent envelope:

```ts
{ data: T }           // Success
{ error: { code: string, message: string } }  // Error
```

Status codes: 201 create, 200 read, 204 delete, 400 bad input, 404 not found, 410 expired, 500 server error.

### Error Handling

`ApiError` class in `lib/errors.ts`, caught at the route level. Unexpected errors return 500 with `INTERNAL_ERROR`. Never leak stack traces.

### Input Validation

Validate at the edge, fail fast. Every POST checks required fields and returns 400 with a descriptive error code before touching Redis.

## Conventional Commits

`feat:` new functionality, `fix:` bug fixes, `refactor:` restructuring, `chore:` config and tooling.

## Plan Mode

Plans are written to `.claude/plans/` via the built-in plan mode. Each plan includes problem statement, data model, endpoints, UI components, and implementation order.

## Bug Tracking

When a bug is found, append to `BUGS.md`:

| What broke | Root cause | Fix applied | Status |
| ---------- | ---------- | ----------- | ------ |
