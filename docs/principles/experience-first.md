# Experience first

Judge a change by what the people on the other side get: the reader of a post, the agent that fetches the `.md` twin or `llms.txt`, and Cody as the author.

**Why:** The site exists to be read. A page that is easy to build and slow to paint fails the reader. A twin that drops content fails the agent. A post that needs edits outside its own folder fails the author.

**Applies to:** code, prose.

**Signs you missed it:**

- A decorative WebGL scene that blocks the first paint, or that leaves an empty box when WebGL is off.
- Motion that ignores `prefers-reduced-motion`, or a page that breaks on a phone or in the dark theme.
- An `<img>` with no `width` and `height`, or a font swap that moves the text after it paints.
- A `.md` twin that drops the text of an MDX component, or an `llms.txt` that leaves out a post.
- A build error that does not name the post file and the bad field.
- A new post that needs an edit in a second place before it shows up.

**In this repo:**

- [`app/features/shrimp-tank/`](../../app/features/shrimp-tank/) loads three.js in a lazy chunk after the first paint.
- [CONVENTIONS.md § Performance](../../CONVENTIONS.md#performance) and [CONVENTIONS.md § Content](../../CONVENTIONS.md#content).

**Enforced by:** `codycodes/img-dimensions` in [`scripts/oxlint-rules/`](../../scripts/oxlint-rules/); review and [prove it works](./prove-it-works.md) for the rest. No lint measures layout shift.
