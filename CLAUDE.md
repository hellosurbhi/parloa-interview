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
    utils.ts                -- ID generation
```

## Target Conventions

Implement these patterns as the codebase grows.

### API Response Contract

All endpoints should return a consistent envelope:

```ts
// Success
{ data: T }

// Error
{ error: { code: string, message: string } }
```

Status codes: 201 create, 200 read, 204 delete, 400 bad input, 404 not found, 410 expired, 500 server error.

### Error Handling

Introduce a typed `ApiError` class in `lib/errors.ts`, caught at the route level:

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

### Input Validation

Validate at the edge, fail fast. Every POST/PUT checks required fields and returns 400 with a descriptive error code before touching the database.

### Shared Types

Extract request/response types into `lib/types.ts` as endpoints grow beyond the initial notes CRUD.

## Conventional Commits

`feat:` new functionality, `fix:` bug fixes, `refactor:` restructuring, `chore:` config and tooling.

## Plan Mode

When asked to plan, write to `PLAN.md`:

1. Problem statement (one sentence)
2. Data model (table name, columns, types, constraints)
3. Endpoints (method, path, request body, response shape)
4. UI components needed
5. Implementation order with estimated complexity

## Bug Tracking

When a bug is found, append to `BUGS.md`:

| What broke | Root cause | Fix applied | Status |
| ---------- | ---------- | ----------- | ------ |
