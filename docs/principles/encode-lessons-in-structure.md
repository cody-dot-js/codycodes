# Encode lessons in structure

When a mistake recurs, turn the lesson into a lint rule, a type, a schema, a test, or a script. Prose is the fallback, not the fix.

**Why:** A check runs on every change and needs no reader to remember it. A doc rule depends on someone who reads it at the right time.

**Applies to:** code, prose.

**Signs you missed it:**

- The same review comment on three PRs.
- A doc rule that a lint rule, a type, or the frontmatter schema could check.
- A gotcha that lives only in one person's notes or one agent's memory.

**In this repo:**

- The custom oxlint rules in [`scripts/oxlint-rules/`](../../scripts/oxlint-rules/), such as `codycodes/img-dimensions`.
- [`app/features/posts/schema.ts`](../../app/features/posts/schema.ts), which turns a frontmatter rule into a build failure.
- [`server.ts`](../../server.ts), which sets the CSP and the security headers on each response, so no page can leave them out.
- [`docs/decisions/`](../decisions/) records the reason for a choice that no check can hold.

**Enforced by:** the checks it creates.
