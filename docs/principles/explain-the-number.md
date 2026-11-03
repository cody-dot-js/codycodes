# Explain the number

When you state a number (a load time, a bundle size, a frame rate, a count), say how you got it and what it measures. Never state a number that you did not measure.

**Why:** A number reads as a fact. One with no method cannot be checked, and one that measures the wrong thing misleads the reader who acts on it.

**Applies to:** code, prose.

**Signs you missed it:**

- "Faster" in a PR or a post with no before and after.
- One Lighthouse run quoted as a result.
- A bundle size with no note of gzip or no gzip, or no note of which chunks load before the first paint.
- A frame rate for the hero with no device or browser.
- A benchmark in a post with no method, hardware, or sample size.

**In this repo:** for a performance change, measure `main` and the branch with the same `pnpm run build` on the same machine, and give the command. A post that quotes a number states how it was measured.

**Enforced by:** review.
