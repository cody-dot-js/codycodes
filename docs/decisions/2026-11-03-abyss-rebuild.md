# Rebuild codycod.es as a prerendered MDX site

**Date:** 2026-11-03 · **Status:** accepted

## Context

codyaprice.com was a 2020 Gatsby site with a bio and 18 old posts. codycod.es was one line. Cody posts on X, and the plan is to post on the site first: each post is one MDX file, the site keeps the dated original, and X gets a copy that links home (the [POSSE](https://indieweb.org/POSSE) pattern).

## Decisions

- **codycod.es is the canonical origin.** Every canonical link, feed, sitemap, and twin uses it. codyaprice.com redirects to it with a 308, so old links keep working.
- **React Router 8, prerendered, with MDX through `@mdx-js/rollup`.** It is the stack of ngrok.com/blog and of `@ngrok/app-server`, so the Vite setup and the move to the server carry over. Astro was the other option: zero JavaScript on a post page by default, but a second framework to keep up.
- **`ssr: false` until `@ngrok/app-server` 0.3.0.** Every page is known at build time, so the output is static files. [docs/app-server.md](../app-server.md) has the plan for the server.
- **One route for each post, whose module is the MDX file.** The router loads the post before it renders, so the prerendered HTML has the whole post, and a client navigation loads only that post's chunk. `app/routes.ts` registers them from the folders.
- **Frontmatter through Zod, parsed once at build time.** A bad post stops the build with the file and the field. Tags are a closed list, so a typo cannot make a new tag page.
- **Start clean.** The 2020 posts do not move. `/blog/*` redirects to `/posts`, so an old link lands on a real page.
- **The abyss brand, dark only.** The tokens match the shrimpposting X cards, so a reader sees one brand from the timeline to the site. Geist and JetBrains Mono are self-hosted, so no page waits on a font host.
- **The dither ocean from the moving X cards runs along the bottom of each page.** It uses the same 8×8 Bayer pattern, dot pitch, and three swells as `waves.js` in the shrimpposting skill, on a 2D canvas at 15 frames a second. One frame takes 0.62 ms to compute at 1440 px wide (median of 200 runs, Node 26, Apple silicon). With reduced motion, it draws one still frame.
- **The shrimp tank hero loads after the first paint.** three.js is 139 kB gzip (from `pnpm run build`, the `scene` chunk). It loads in its own chunk from an effect, and the tank keeps its size, so the load moves nothing.
- **The brand's header shrimp swims at the top right of every page.** It is the X header art, split into a body layer and a dither-wisps layer, with the swimmerets paddling as on the moving X cards (`templates/waves.js`). The two layers are 130 kB as WebP at quality 88 (87 kB and 42 kB, from `cwebp -q 88`; the PNGs are 664 kB). The stills are in the HTML, and the motion loads after the first paint at 30 frames a second, only while it is on screen.
- **The 3D shrimp in the hero is a pet.** He follows a near cursor, and a click makes him squint, float pixel hearts, swim a lap, and say a line in a dithered speech bubble.
- **A markdown twin for each post, and `llms.txt`.** Agents that fetch a post get its source at `/posts/<slug>.md`. The cost is one prerendered file for each post.
- **Agent-first repo rules** from the app-server, mantle, and frontend repos: `AGENTS.md`, `CONVENTIONS.md`, the principles, every oxlint category on, strict TypeScript, and a hook that lints each edit.

## Open

- A light theme for long reads.
- Open Graph images made from the X card template at build time.
- The rest of the MDX kit (`Diff`, `Card`, `Figure`, `Tweet`, `Demo`), each with a form for the X copy.
- Syntax highlighting in code blocks.
