# codydotjs.dev

Cody Price's personal site. Posts are MDX files. React Router 8 prerenders each known page, and [`@ngrok/app-server`](https://github.com/ngrok/app-server) serves the site. The site keeps the dated original of each post; copies on X link back to it.

Agents: start at [AGENTS.md](./AGENTS.md).

## Setup

The repo pins Node and pnpm with [mise](https://mise.jdx.dev). `./scripts/install-mise` installs mise if you do not have it.

```sh
mise install
pnpm install
pnpm run dev
```

## Commands

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `pnpm run dev`     | The dev server, with drafts from `content/drafts/` |
| `pnpm run build`   | Prerenders every page into `build/client/`         |
| `pnpm run preview` | Serves the build through the production pipeline   |
| `pnpm run check`   | Format check, lint, typecheck, and tests           |
| `pnpm run fmt`     | Formats every file with oxfmt                      |

## Layout

- `content/posts/<slug>/post.mdx`: one post. [content/AGENTS.md](./content/AGENTS.md) has the guide.
- `app/features/posts/`: the frontmatter contract, the post index, and the markdown twin.
- `app/features/feeds/`: `rss.xml`, `sitemap.xml`, and `llms.txt`.
- `app/features/shrimp-tank/`: the 3D shrimp on the home page.
- `app/redirects.ts`: the one redirect table.
- `server.ts`: the server pipeline: redirects, security headers, the CSP, and markdown twins.
- `docs/`: the principles and the decisions.

## Deploy

Vercel runs `pnpm run build`. With `VERCEL=1`, the `vercel` host of `@ngrok/app-server` writes `.vercel/output`: one function for the pages, and the CDN for `/assets/`.

- `codydotjs.dev` is the production domain and the canonical origin (`SITE_ORIGIN` in `app/site.ts`).
- Add `codyaprice.com` to the same Vercel project as a domain that redirects to `codydotjs.dev` (Domains → Redirect to another domain → 308).
