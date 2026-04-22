# Bugs Found & Fixed

| What broke | Root cause | Fix applied | Status |
| ---------- | ---------- | ----------- | ------ |
| DELETE allows deleting URLs with NULL user_id | `NULL !== string` always true in JS | Check `!row.user_id \|\| row.user_id !== user.id` | Fixed |
| Notes endpoints have no auth | `requireAuth()` never added to notes routes | Added `requireAuth()` to POST, GET, DELETE | Fixed |
| No content length limit on notes | Missing validation on content field | Added 10KB max limit | Fixed |
| Alias race condition on concurrent requests | TOCTOU between SELECT check and INSERT | Catch UNIQUE constraint violation on INSERT | Fixed |
| No security headers on responses | `next.config.mjs` was empty | Added X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | Fixed |
| Vercel redirect URLs default to localhost | `new URL(request.url).origin` returns localhost in serverless | Use `x-forwarded-proto` + `host` headers | Fixed |
| SQLite fails on Vercel read-only filesystem | `data.db` created in `process.cwd()` which is read-only on Vercel | Use `/tmp/data.db` when `VERCEL` env var is set | Fixed |
