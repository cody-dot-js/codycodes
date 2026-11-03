# Fix root causes

Find the cause of a bug and fix it there. Do not add a guard where the symptom shows.

**Why:** A guard at the symptom hides the cause from the next caller, who hits it again without the guard. The fix at the cause protects every caller at once.

**Applies to:** code.

**Signs you missed it:**

- A `try`/`catch` that swallows an error which the code should never throw.
- A longer timeout that makes a flaky test pass.
- A frontmatter field made optional so that one bad post passes the build.
- An `!important` or a second class for a Tailwind class that silently does nothing.
- A test that mocks away the failing part instead of fixing it.

**In this repo:** a fix comes with a test that fails without it ([CONVENTIONS.md § Testing](../../CONVENTIONS.md#testing)). When the cause is outside this repo, a `Why:` comment names it and links the upstream issue.

**Enforced by:** review, and the regression test.
