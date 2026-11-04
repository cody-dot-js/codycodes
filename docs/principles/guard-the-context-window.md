# Guard the context window

Load only what the task needs, and keep each always-loaded file small. Link to a rule; do not copy it into the router.

**Why:** Every byte that an agent loads before the first edit competes with the task. Some harnesses also cut long files, so a large ruleset loses rules with no sign.

**Applies to:** code, prose.

**Signs you missed it:**

- A rule copied into `AGENTS.md` that `CONVENTIONS.md` owns.
- A post task that loads the full code ruleset.
- A fact that a command can answer, such as a version or a dependency list.
- A whole large file read to find one function.

**In this repo:** [AGENTS.md](../../AGENTS.md) routes each task to the [CONVENTIONS.md](../../CONVENTIONS.md) sections that it needs. Put a new rule in the narrowest file that covers it: a code comment, a `CONVENTIONS.md` section, or a decision in [`docs/decisions/`](../decisions/).

**Enforced by:** review of changes to `AGENTS.md`.
