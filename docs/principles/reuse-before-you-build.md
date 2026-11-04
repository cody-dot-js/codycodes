# Reuse before you build

Search for an existing helper, React Router feature, or Web API before you write a new one.

**Why:** A second copy drifts from the first, and a bug fixed in one stays in the other. A reader must also learn two names for one idea.

**Applies to:** code, including a custom component in a post.

**Signs you missed it:**

- A second frontmatter parser, date formatter, or slug helper beside the one in `app/features/posts/`.
- A hand-written MDX component for a job that plain Markdown does, such as a table or a link.
- A new dependency for a job that a Web API does: `Intl.DateTimeFormat`, `URL`, `IntersectionObserver`, `matchMedia`.
- Hand-written `<head>` tags or prerender code for a job that React Router's `meta`, `links`, or `prerender` already does.
- A second three.js setup beside the one in `app/features/shrimp-tank/`.

**In this repo:** look in `app/features/` first, then in React Router and the Web platform. Check `package.json` before you add a dependency ([CONVENTIONS.md § Package Management](../../CONVENTIONS.md#package-management)).

**Enforced by:** review, and `codydotjs/prefer-url-parse` in [`scripts/oxlint-rules/`](../../scripts/oxlint-rules/).
