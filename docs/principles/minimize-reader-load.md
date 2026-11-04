# Minimize reader load

Write code and prose that a reader understands in one pass. Choose plain names, early returns, short sentences, and one idea for each unit.

**Why:** Code and posts are read far more often than they are written. Every clever line costs each later reader the time it saved the writer.

**Applies to:** code, prose.

**Signs you missed it:**

- A nested ternary, or a boolean positional argument.
- A short name for anything that lives past one line.
- A comment that explains confusing code instead of a rename that removes the confusion.
- An MDX component whose look depends on a wrapper that the reader cannot see from the post.
- A sentence with two independent ideas, or a condition at its end.

**In this repo:** [CONVENTIONS.md § Code Quality](../../CONVENTIONS.md#code-quality), [CONVENTIONS.md § Writing](../../CONVENTIONS.md#writing), and the `simplified-technical-english` skill.

**Enforced by:** oxfmt; oxlint with `codydotjs/descriptive-names`, `codydotjs/no-boolean-positional-param`, `codydotjs/no-jsx-null-ternary`, and `codydotjs/prefer-function-declaration` from [`scripts/oxlint-rules/`](../../scripts/oxlint-rules/); review for the rest.
