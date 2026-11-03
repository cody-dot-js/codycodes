# Move to `@ngrok/app-server`

The plan to serve this site with [`@ngrok/app-server`](https://github.com/ngrok/app-server) after it ships 0.3.0. Today the site is static files on Vercel (`ssr: false`), and `vercel.json` holds the redirects and the headers.

## Why move

- **Content negotiation.** An agent that sends `Accept: text/markdown` to `/posts/<slug>` gets the markdown twin, with `Vary: Accept` and a `Link: rel="alternate"` header. Static files cannot negotiate.
- **One redirect table.** `defaultPlugins({ redirects })` takes `REDIRECTS` from `app/redirects.ts` as it is. `vercel.json` and its drift test go away.
- **Headers from one place.** The security headers, a CSP from build-time script hashes, and cache headers for prerendered pages come from the pipeline, not a JSON file.
- **Preview deploys.** `noindex()` keeps a preview deploy out of search.
- **Room for a request-time feature** later, such as a view counter, without a second server.

## When

After `@ngrok/app-server@0.3.0` is on npm. The 0.3.0 release adds the `vercel` host that this plan needs. Check the [changelog](https://github.com/ngrok/app-server/blob/main/CHANGELOG.md) for breaking changes before step 1.

## Steps

Each step ends with a check. Do not start the next step until it passes ([sequence verifiable units](./principles/sequence-verifiable-units.md)).

1. **Add the server.** `pnpm add -E @ngrok/app-server hono`. In `vite.config.ts`, add `appServer({ host: vercel() })` after `reactRouter()`. Add `server.ts`:

   ```ts
   import { createServer, defaultPlugins } from "@ngrok/app-server";

   import { REDIRECTS } from "./app/redirects.ts";

   export default createServer({
     plugins: defaultPlugins({
       redirects: REDIRECTS,
       noindex: process.env.VERCEL_ENV !== "production",
       prerendered: { markdownTwins: true },
     }),
   });
   ```

   Check: `pnpm run build` writes `.vercel/output`, and `pnpm exec app-server start` serves `/`, `/posts`, and `/rss.xml`.

2. **Turn on the server render.** In `react-router.config.ts`, set `ssr: true` and keep the `prerender` list. Prerendered pages still come from the build; the function serves them through the pipeline.
   Check: each prerendered path answers 200 with its file, and an unknown path answers 404 from `routes/not-found.tsx`.

3. **Negotiate markdown.** The default twin path is the page path plus `.md`, which is the `/posts/<slug>.md` route today, so `markdownTwins: true` needs no `twinOf`.
   Check: `curl -H 'Accept: text/markdown' /posts/<slug>` returns the twin with `Vary: Accept`, and the HTML answer has the `Link` header.

4. **Delete what the server replaces** ([migrate callers, then delete](./principles/migrate-callers-then-delete.md)):
   - `redirects` and `headers` in `vercel.json`, and the `vercel.json` check in `app/redirects.test.ts`. Keep `toVercelRedirect` only if something still calls it.
   - The `buildEnd` hook that copies `404.html`.
   - `scripts/preview.ts`. `app-server start` serves the build the way production does.
   - The "Why no `+types` import" workarounds in `post-layout.tsx` and `post-markdown.ts`, if `ssr: true` lets the routes register with no posts.
   - The `ssr: false` rule in `AGENTS.md`, and this file's "Today" sentence.

   Check: `pnpm run check` and `pnpm run build` pass, and a preview deploy answers each check above.

5. **Deploy.** Point the Vercel project at `vercel deploy --prebuilt`, or at the build output that the `vercel` host writes. Then check the production URLs from step 3.

## Not in scope

- A runtime post index. Posts stay build-time content, parsed once in `posts.server.ts`.
- A second host. The `node` host stays an option for a Docker deploy, with no code change.
