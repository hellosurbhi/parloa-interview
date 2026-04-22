# CLAUDE.md

## Stack

Next.js 14 App Router, TypeScript, Tailwind, SQLite (better-sqlite3), nanoid. Deployed on Vercel via push-to-deploy.

## Architecture

```
src/
  app/
    page.tsx                -- UI
    api/notes/route.ts      -- POST /api/notes
    api/notes/[id]/route.ts -- GET, DELETE /api/notes/:id
  lib/
    db.ts                   -- connection + schema init
    errors.ts               -- ApiError class
    types.ts                -- shared request/response types
    utils.ts                -- ID generation, validation helpers
```

## API Response Contract

All endpoints return a consistent envelope:

```ts
// Success
{ data: T }

// Error
{ error: { code: string, message: string } }
```

Status codes: 201 create, 200 read, 204 delete, 400 bad input, 404 not found, 410 expired, 500 server error.

## Error Handling

Typed errors, caught at the route level:

```ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

// In routes
throw new ApiError(404, "NOTE_NOT_FOUND", "Note does not exist");
```

Unexpected errors return 500 with `INTERNAL_ERROR`. Never leak stack traces to the client.

## Input Validation

Validate at the edge, fail fast. Every POST/PUT checks required fields and returns 400 with a descriptive error code before touching the database.

```ts
if (!body.content?.trim())
  throw new ApiError(400, "CONTENT_REQUIRED", "Content cannot be empty");
if (body.content.length > 50000)
  throw new ApiError(400, "CONTENT_TOO_LARGE", "Max 50KB");
```

## Conventional Commits

`feat:` new functionality, `fix:` bug fixes, `refactor:` restructuring, `chore:` config and tooling.

## Plan Mode

When asked to plan, write to `plan.md`:

1. Problem statement (one sentence)
2. Data model (table name, columns, types, constraints)
3. Endpoints (method, path, request body, response shape)
4. UI components needed
5. Implementation order with estimated complexity

## Bug Tracking

When a bug is found, append to `bugs.md`:

| What broke | Root cause | Fix applied | Status |
| ---------- | ---------- | ----------- | ------ |
