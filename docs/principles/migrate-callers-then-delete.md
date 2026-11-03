# Migrate callers, then delete

When you replace an API, move every caller to the new one, then remove the old one in the same change. Do not leave two paths that do the same job.

**Why:** A kept old path is a second API to read, test, and fix. Callers keep choosing it, so it never goes away.

**Applies to:** code, prose.

**Signs you missed it:**

- A re-export file that forwards to a new location.
- A deprecated alias or a mode flag for the old behavior, with no removal planned.
- A moved post that keeps a copy at the old path instead of one entry in the redirect table.
- Vercel-only config that stays after `@ngrok/app-server` takes over its job.

**In this repo:**

- The callers are the routes, the components, the posts, and the tests.
- When a post moves, add the old URL to [`app/redirects.ts`](../../app/redirects.ts) and delete the old copy.
- [`docs/app-server.md`](../app-server.md) is the plan for the move to `@ngrok/app-server`. Each step removes what the server replaces.

**Enforced by:** `pnpm run typecheck`, because a stale caller fails to compile once the old API is gone; the redirect test for moved posts.
