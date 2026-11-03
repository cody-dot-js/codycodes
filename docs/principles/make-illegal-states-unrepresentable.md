# Make illegal states unrepresentable

Model a contract in the types so that the compiler rejects a wrong use. What the types cannot catch fails loudly, at build time when it can.

**Why:** A type error shows at the call site, before the code ships. A runtime check shows only on the path that a test or a page view happens to reach.

**Applies to:** code.

**Signs you missed it:**

- Two optional frontmatter fields that are valid only together, such as an image and its alt text.
- A string field that accepts any value but handles three.
- `isLoading`, `isError`, and `scene` as three independent fields for the hero, instead of one union.
- A `value as Type` assertion or a `!` that silences an error instead of fixing the model.

**In this repo:**

- [CONVENTIONS.md § TypeScript](../../CONVENTIONS.md#typescript).
- [`app/features/posts/schema.ts`](../../app/features/posts/schema.ts) infers the frontmatter type from the Zod schema, so the type and the check have one source.

**Enforced by:** `pnpm run typecheck` with the strict options in [`tsconfig.json`](../../tsconfig.json), and the type-aware oxlint rules in [`.oxlintrc.json`](../../.oxlintrc.json).
