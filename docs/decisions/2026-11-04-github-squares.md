# GitHub squares on the home page

**Date:** 2026-11-04 · **Status:** accepted

## Context

The home page shows Cody's GitHub contribution graph in the abyss colors. The home page is prerendered, so data from its loader is as old as the last deploy. The graph changes each day.

## Decisions

- **The public contribution page, not the GraphQL API.** `github.com/users/<name>/contributions` needs no token. A Zod schema checks each day, so a markup change stops the build and does not render a bad graph.
- **Build data first, fresh data after.** The prerendered HTML has the days from the build, so the graph shows at once and shifts nothing. After the first paint, the page gets the fresh days from `/github-contributions.json` and draws them in the same box.
- **A Hono route in `server.ts`.** The fresh days are work for each request, so they go in `server.ts`, not in a loader. The CDN keeps one copy for 10 minutes (`s-maxage=600`), so GitHub gets few requests.
- **Zod loads after paint.** The page imports the schema in the refresh, so the first load has no zod.
- **Blush, not green.** Teal is for "after" only, so the shades are blush at 25, 50, 75, and 100 percent.

## Consequences

- When GitHub is down at build time, the build fails. Run it again.
- When the route fails in the browser, the page keeps the days from the build.
- The graph can be 10 minutes old, plus the stale time when the route is slow.
