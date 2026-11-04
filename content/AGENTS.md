# Writing a post

Each post is one folder: `content/posts/<slug>/post.mdx`. The folder name is the slug and the URL, `/posts/<slug>`. A new folder is a new page; register nothing.

Drafts live in `content/drafts/<slug>/post.mdx`. `pnpm run dev` shows them. A production build skips them. To publish, move the folder to `content/posts/`.

## Frontmatter

`app/features/posts/schema.ts` is the contract. The build parses each post and stops on the first one that breaks it, with the file and the field.

```yaml
---
title: The LCP was a 249 kB blur
description: One or two sentences for the post list, the feed, and the link preview.
date: 2026-11-03
tags:
  - perf
syndication:
  - https://x.com/codydotjs/status/...
---
```

- `date` is the publish date. The site copy is the dated original, so it never moves.
- `updated` is optional. Set it only for a real change.
- `tags` come from `TAGS` in `app/features/posts/tags.ts`.
- `syndication` lists the copies on other platforms. Add each URL after that copy ships.

## Body

- Write markdown. The page renders the title, the date, the tags, and the description from the frontmatter. Do not repeat them in the body.
- Use `##` for sections. The title is the only `h1`.
- Import a kit part from `app/components/mdx/`, such as `BeforeAfter`. Put a component that only one post uses next to that post.
- A live demo is a route module next to the post: `demo.tsx`, or `demo-<name>.tsx` for a second one. It is a page at `/posts/<slug>/<file name>`, with no site chrome. Embed it with `LiveDemo` from `app/components/mdx/`.
- Each post gets a markdown twin at `/posts/<slug>.md` for agents. It is the MDX source with the imports removed, so a demo shows as its JSX.

## Before you publish

- Every claim has a source, and every number says how it was measured ([explain the number](../docs/principles/explain-the-number.md)).
- Nothing from ngrok's private work goes in a post until it is public.
- Run `pnpm run build`, then `pnpm run preview`, and read the post on the page.
