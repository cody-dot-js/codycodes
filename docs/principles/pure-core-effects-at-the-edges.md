# Pure core, effects at the edges

Write sorting, filtering, date formatting, slug logic, and text generation as small pure functions. Keep the file glob, the browser, and the WebGL renderer in the callers.

**Why:** A pure function gives the same output for the same input. A test calls it with a value, with no build, no render, no DOM, and no timer.

**Applies to:** code.

**Signs you missed it:**

- A transform that a test reaches only through a full build or a full render.
- A function that reads `Date.now()`, `window`, or `import.meta.glob` instead of taking the value as an argument.
- A `sort()` that changes the shared post index in place, where `toSorted()` returns a new array.
- Motion math in the hero that a test reaches only through a WebGL context.

**In this repo:**

- The `import.meta.glob` in [`posts.server.ts`](../../app/features/posts/posts.server.ts) is the edge. [`posts.ts`](../../app/features/posts/posts.ts) parses, sorts, and filters in functions that take the list.
- In [`app/features/shrimp-tank/`](../../app/features/shrimp-tank/), the three.js renderer is the edge. Keep the scene math apart from it.

**Enforced by:** review.
