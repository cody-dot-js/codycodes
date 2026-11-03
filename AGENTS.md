# codycod.es agent guide

Cody Price's personal site: MDX posts in the abyss brand, prerendered to static files with React Router 8. One package at the repo root, deployed on Vercel. It moves to `@ngrok/app-server` after that package ships 0.3.0 ([docs/app-server.md](./docs/app-server.md)).

This file follows the [AGENTS.md standard](https://agents.md) and is canonical for every harness. `CLAUDE.md` is a symlink to it; edit `AGENTS.md` only. Every task loads this file, so it holds only what every task needs. [Guard the context window](./docs/principles/guard-the-context-window.md) before you add to it.

## Route by task

Read the files for your task before the first edit. Work is incomplete until you check your diff against them.

- **Any code** (`app/`, `scripts/`, config, CI): [CONVENTIONS.md](./CONVENTIONS.md) in full.
- **A post** (`content/`): [content/AGENTS.md](./content/AGENTS.md). A post that adds a component also follows the code rule.
- **The frontmatter contract:** `app/features/posts/schema.ts`. Change the schema, then every post that it breaks, in one change.
- **A redirect:** `app/redirects.ts` is the one table. Update `vercel.json` to match; `app/redirects.test.ts` fails when they drift.
- **The shrimp tank** (`app/features/shrimp-tank/`): [CONVENTIONS.md § Performance](./CONVENTIONS.md#performance). The scene loads after the first paint, and the tank keeps its size the whole time.
- **A host, a header, or a server feature:** [docs/app-server.md](./docs/app-server.md) first. Do not add a server-side workaround that the move to `@ngrok/app-server` deletes.
- **A custom lint rule:** `scripts/oxlint-rules/`, one file for each rule, with tests in `scripts/oxlint-plugin.test.ts`.
- **A decision with trade-offs:** add a record in [docs/decisions/](./docs/decisions/).
- **A change a person sees** (a page, a post, the brand): run the build and look at the page in a browser before you report done ([prove it works](./docs/principles/prove-it-works.md)).
- **Comments, JSDoc, commits, PR descriptions, and repo markdown:** load the [`simplified-technical-english`](./.claude/skills/simplified-technical-english/SKILL.md) skill. Post prose is Cody's voice, not this style.

## Principles

Short, named rules for how to work. Each name links to its full rule. When you apply a principle, name it and the decision it changed. [docs/principles/README.md](./docs/principles/README.md) explains the format.

- [Write less code](./docs/principles/write-less-code.md) (code, prose): the smallest change that meets the task.
- [Subtract before you add](./docs/principles/subtract-before-you-add.md) (code, prose): remove a cause before you guard it.
- [Reuse before you build](./docs/principles/reuse-before-you-build.md) (code): search `app/`, React Router, and Web APIs first.
- [Minimize reader load](./docs/principles/minimize-reader-load.md) (code, prose): code and prose that read in one pass.
- [Experience first](./docs/principles/experience-first.md) (code, prose): judge a change by the reader, the agent that fetches a twin, and the author.
- [Make illegal states unrepresentable](./docs/principles/make-illegal-states-unrepresentable.md) (code): contracts in types.
- [Pure core, effects at the edges](./docs/principles/pure-core-effects-at-the-edges.md) (code): pure transforms; file reads, globs, and WebGL at the edges.
- [Derive, don't sync](./docs/principles/derive-dont-sync.md) (code): compute slugs, URLs, feeds, and lists from the posts.
- [Validate at the boundary](./docs/principles/validate-at-the-boundary.md) (code): parse frontmatter once, at build time.
- [Migrate callers, then delete](./docs/principles/migrate-callers-then-delete.md) (code): no two paths for one job.
- [Fix root causes](./docs/principles/fix-root-causes.md) (code): fix the cause, not the symptom.
- [Prove it works](./docs/principles/prove-it-works.md) (code, prose): run the check, and say what you ran.
- [Test behavior, not implementation](./docs/principles/test-behavior-not-implementation.md) (code): assert what a reader or a caller sees.
- [Explain the number](./docs/principles/explain-the-number.md) (code, prose): say how you measured it.
- [Sequence verifiable units](./docs/principles/sequence-verifiable-units.md) (code): small steps, each checked.
- [Encode lessons in structure](./docs/principles/encode-lessons-in-structure.md) (code, prose): a check beats a doc rule.
- [Guard the context window](./docs/principles/guard-the-context-window.md) (code, prose): load only what the task needs.

## Rules

- A comment says why, not what. Start it with `Why:` when it explains a choice.
- Lint turns on every oxlint category. A rule goes off only in `.oxlintrc.json`, with a reason. A suppression comment also gives a reason: `// oxlint-disable-next-line <rule> -- <reason>`.
- Check for no value with `== null` and `!= null`. Lint rejects `=== null`, `=== undefined`, and `== undefined`.
- Every page is prerendered (`ssr: false`). A loader runs only at build time. Code that must run for each request waits for `@ngrok/app-server`.
- Tests assert behavior that a caller sees. A fix comes with a test that fails without it.

## Before you edit

- Search before you create a helper, a parser, a component, or a dependency. Look in `app/features` and `app/components` first.
- Other sessions can work in the same checkout. Run `git status` before you stage, and stage by path. Never `git add -A`.
- Do not revert a working-tree change you did not make. Ask first.

## Before you finish

Run checks when a coherent unit of work is done and again before the final response, not after each edit.

1. Read `git diff` for your files. Check them against the files that [Route by task](#route-by-task) names, and fix the drift.
2. Run `pnpm run check` and `pnpm run build`, and make them pass.
3. Stop each process you start: a dev server, a preview server, a test watcher, or a browser.
4. Name the principles you applied and the decision each one changed. End with a `Conventions pass:` note that says what you checked. If you did not run a check, say why.

## Commands

```sh
pnpm install
pnpm run dev          # the dev server, with drafts
pnpm run build        # prerender every page into build/client
pnpm run preview      # serve build/client the way the host does
pnpm run check        # fmt:check, lint, typecheck, test
pnpm run fmt          # oxfmt; never hand-format
```

Do not pipe a check through `tail` or `head`. The pipe returns the exit code of the last command, so a failed check looks green. Set `pipefail` or redirect to a file instead.
