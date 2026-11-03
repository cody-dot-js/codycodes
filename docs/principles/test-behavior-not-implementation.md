# Test behavior, not implementation

Assert what a reader or a caller sees: the rendered text, a role and its name, a link target, a redirect, the post index, or the text of a `.md` twin.

**Why:** A test that mirrors the code turns red on each refactor and stays green on a real bug. The author then learns to make the test match instead of reading the failure.

**Applies to:** code.

**Signs you missed it:**

- An assertion on an internal call count or a private variable.
- A Tailwind class assertion where a role, a name, or a state would do.
- A hero test that asserts three.js calls instead of what the reader sees, such as the text fallback when WebGL is off.
- A constant asserted against a copy of itself.
- A sleep that waits for an animation frame or a timer.
- A test with no answer to "what one-line change turns this red?"

**In this repo:** [CONVENTIONS.md § Testing](../../CONVENTIONS.md#testing). Tests run in vitest with Testing Library and happy-dom, and query the page as a reader does.

**Enforced by:** oxlint with `codycodes/no-only-to-be-defined`, `codycodes/no-config-teardown`, and `codycodes/no-sleep-in-tests` from [`scripts/oxlint-rules/`](../../scripts/oxlint-rules/); review for the rest.
