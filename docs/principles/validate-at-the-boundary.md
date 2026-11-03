# Validate at the boundary

Parse untrusted input once, where it enters: post frontmatter, a URL parameter, an environment value, or browser storage. Inside the boundary, trust the parsed type. Check content at build time, so that a bad post never reaches a reader.

**Why:** A check at the entry gives one clear failure. Checks spread through the code repeat the work, miss a path, and let a bad value travel far before it fails. The site is fully prerendered, so a frontmatter error at build time stops a deploy. The same error at view time ships a broken page.

**Applies to:** code.

**Signs you missed it:**

- A post that ships without frontmatter validation.
- A cast on frontmatter, `JSON.parse`, or `localStorage`.
- The same `typeof` or `== null` guard on a post field in several components.
- A frontmatter error that shows only when someone opens the page.
- A slug from the URL that reaches a lookup with no "not found" path.

**In this repo:** [`app/features/posts/schema.ts`](../../app/features/posts/schema.ts) is the Zod frontmatter contract. The build parses each post with it once, and components take the parsed type.

**Enforced by:** the build, which fails on a post that does not match the schema; review for the rest.
