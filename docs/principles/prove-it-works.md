# Prove it works

Before you report a change as done, run the checks that would catch it if it were wrong, and say what you ran. A claim with no check is a guess.

**Why:** A reviewer cannot rerun your session. The check output is the only evidence that the change does what you say. A passing typecheck does not show that a page renders.

**Applies to:** code, prose.

**Signs you missed it:**

- "Should work" or "this fixes it" with no command output.
- A post or a page change that nobody opened in a browser.
- A hero change checked only on the dev server. The lazy chunk and the first paint show only in a production build.
- A redirect, a `.md` twin, or `llms.txt` that nobody fetched from the built site.
- A code sample in a post that nobody ran.

**In this repo:**

- [AGENTS.md § Before you finish](../../AGENTS.md#before-you-finish) sets what to run.
- `pnpm run check` runs format, lint, typecheck, and tests.
- For a change that a reader sees, run `pnpm run build` and `pnpm run preview`. Look at the page at phone and desktop widths, in the light and dark themes. Stop the preview server after.

**Enforced by:** `pnpm run check` for code. A visual check needs a person or a browser tool.
