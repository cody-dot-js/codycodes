# Move the canonical origin to codydotjs.dev

**Date:** 2026-11-04 · **Status:** accepted

## Context

The site name, the X handle, and the GitHub name did not match: `codycod.es`, `@codydotjs`, and `cody-dot-js`. The `codydotjs.dev` domain matches all three.

## Decisions

- **`codydotjs.dev` is the canonical origin.** It replaces `codycod.es` in [the rebuild record](./2026-11-03-abyss-rebuild.md). `SITE_ORIGIN` in `app/site.ts` is the one source, so every canonical link, feed, sitemap, and twin moves with it.
- **The old domains redirect with a 308.** `codycod.es` and `codyaprice.com` stay on the Vercel project, so old links keep working.
- **The custom lint rules use the `codydotjs/` prefix.** The prefix follows the brand, not the old domain.

## Consequences

- Until DNS points `codydotjs.dev` at Vercel, canonical links and feeds name a domain that does not serve the site.
- `public/og.jpg` still shows `CODYCOD.ES`. A new image must replace it.
