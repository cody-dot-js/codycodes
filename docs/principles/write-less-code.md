# Write less code

Solve the task with the smallest change that meets it. Every line you add is a line someone must read, test, and keep.

**Why:** Code costs more to keep than to write. This site has one maintainer, so each component, option, and helper is work that Cody does again at each upgrade.

**Applies to:** code, prose.

**Signs you missed it:**

- A component, hook, or helper with one caller, made for one post.
- A prop or an option that has the same value at every call site.
- Support for a second author, a locale, or a feed format that nobody asked for.
- A guard, a retry, or a lock for a race or an attack that nobody can name a concrete failure for.
- A paragraph in a post that restates its heading, or a closing summary of the section above it.

**In this repo:**

- [CONVENTIONS.md § Code Quality](../../CONVENTIONS.md#code-quality).
- Before you add complexity for an unlikely race or security edge case, give Cody the concrete failure, its likelihood, and the cost. Add it only when he agrees.

**Enforced by:** review.
