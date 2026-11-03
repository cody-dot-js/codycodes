# codyaprice.com

Cody Price's personal site. Posts are MDX files, and every page is prerendered to static files with React Router 8. The site keeps the dated original of each post; copies on X link back to it.

Agents: start at [AGENTS.md](./AGENTS.md).

## Setup

The repo pins Node and pnpm with [mise](https://mise.jdx.dev). `./scripts/install-mise` installs mise if you do not have it.

```sh
mise install
pnpm install
pnpm run dev
```

## Commands

| Command            | What it does                                        |
| ------------------ | --------------------------------------------------- |
| `pnpm run dev`     | The dev server, with drafts from `content/drafts/`  |
| `pnpm run build`   | Prerenders every page into `build/client/`          |
| `pnpm run preview` | Serves `build/client/` the way the static host does |
| `pnpm run check`   | Format check, lint, typecheck, and tests            |
| `pnpm run fmt`     | Formats every file with oxfmt                       |

## Layout

- `content/posts/<slug>/post.mdx`: one post. [content/AGENTS.md](./content/AGENTS.md) has the guide.
- `app/features/posts/`: the frontmatter contract, the post index, and the markdown twin.
- `app/features/feeds/`: `rss.xml`, `sitemap.xml`, and `llms.txt`.
- `app/features/shrimp-tank/`: the 3D shrimp on the home page.
- `app/redirects.ts`: the one redirect table.
- `docs/`: the principles, the decisions, and the [move to `@ngrok/app-server`](./docs/app-server.md).

## Deploy

Vercel builds the site with `vercel.json`: `pnpm run build`, then it serves `build/client/` as static files.

- `codyaprice.com` is the production domain.
- Add `codycod.es` to the same Vercel project as a domain that redirects to `codyaprice.com` (Domains → Redirect to another domain → 308).
