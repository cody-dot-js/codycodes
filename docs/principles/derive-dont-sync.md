# Derive, don't sync

Compute a value from the source that already holds it. Do not copy it into a second place and keep the two in step.

**Why:** Two copies of one fact disagree sooner or later. On this site, the copy that drifts is a list: a post index, a redirect, or an `llms.txt` entry that the author forgot to update.

**Applies to:** code.

**Signs you missed it:**

- A hand-kept list of posts, tags, or prerender paths that a glob could derive.
- A redirect table kept in two places.
- An `llms.txt` entry or a `.md` twin written by hand instead of built from the post.
- A date or a slug in both the frontmatter and the folder name.
- A `useEffect` that sets state from props or loader data.

**In this repo:**

- [`app/features/posts/posts.server.ts`](../../app/features/posts/posts.server.ts) derives the post index from an `import.meta.glob` of `content/posts/*/post.mdx`, and [`files.server.ts`](../../app/features/posts/files.server.ts) derives the routes and prerender paths from the same folders.
- [`app/redirects.ts`](../../app/redirects.ts) is the one redirect table.

**Enforced by:** review. [`server.ts`](../../server.ts) reads the one redirect table, so there is no copy to drift.
