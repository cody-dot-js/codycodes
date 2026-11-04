# Serve the site with `@ngrok/app-server`

**Date:** 2026-11-04 · **Status:** accepted

## Context

The site was static files on Vercel (`ssr: false`), and `vercel.json` held the redirects and the headers. Static files cannot negotiate content, and a static host cannot give a page a CSP from the hashes of its inline scripts. `@ngrok/app-server` 0.3.0 added a `vercel` host.

## Decisions

- **`ssr: true`, and the build still prerenders each known page.** The server sends a prerendered page from its file. It renders only the other URLs, such as a 404, which now answers with status 404.
- **One pipeline in `server.ts`** for the redirects, the security headers, a CSP on each document, `frame-ancestors 'self'`, and `noindex` on preview deploys. `vercel.json` keeps only the install and build commands.
- **Markdown twins by content negotiation.** A request with `Accept: text/markdown` for a post gets its `.md` twin, with `Vary: Accept`. The HTML answer gets a `Link` header to the twin.
- **The stale-build client.** After a deploy, an open tab loads its next page as a document, so old code never renders new data.
- **The `vercel` host only on Vercel.** A local build uses the `node` host, so `pnpm run preview` serves the build through the same pipeline.

## Consequences

- Each page request runs the function. Prerendered pages send `Cache-Control: public, max-age=0, must-revalidate`, so the CDN does not keep them. A post page has a twin and a `Vary: Accept`, so a CDN cache for it must key on `Accept` first.
- The CSP allows inline styles, because Shiki and React `style` props write them, and `data:` images and fonts, for the tab icon frames and an inlined font.
- `pnpm-workspace.yaml` exempts `@ngrok/app-server@0.3.0` from the 6-hour release age. Remove the entry at the next upgrade.
