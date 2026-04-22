# Parloa Interview

Scaffolded repo for a live systems design interview with Parloa. Built incrementally during the session.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SQLite via better-sqlite3
- nanoid for ID generation

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## API

### `POST /api/notes`

Create a note.

```json
{ "content": "hello", "expires_in": 3600 }
```

Returns `201` with `{ id, content, created_at }`.

### `GET /api/notes/:id`

Fetch a note. Returns `404` if not found, `410` if expired.

### `DELETE /api/notes/:id`

Delete a note. Returns `204`.

## Project Structure

```
src/
  lib/
    db.ts          # SQLite connection + schema
    utils.ts       # ID generation
  app/
    page.tsx       # Landing page
    api/
      notes/
        route.ts       # POST
        [id]/route.ts  # GET, DELETE
```
