# Conventions

The code and prose rules for every file in this repo. Read this file in full before you change code. Every rule is mandatory: call out and fix violations. The rules come from the ngrok app-server, mantle, and frontend repos, cut to what a static personal site needs.

A rule tagged `(lint: name)` has an oxlint check, and the lint message says why and how to fix it. Custom rules are `codycodes/<name>` in [scripts/oxlint-rules/](./scripts/oxlint-rules/). An untagged rule has no check, so you and the reviewer enforce it.

## Files & Modules

- kebab-case file names, except names a framework requires. (lint: `unicorn/filename-case`)
- ESM only. Prefer named exports; a route module, the root, and a config export a default because their tool loads it. (lint: `import/no-default-export`)
- Import with the `~/` alias in `app/`. Write the file extension: `~/site.ts`, `./posts.ts`.
- Use a top-level `import type` for a type-only import. (lint: `import/consistent-type-specifier-style`)
- Never write a barrel file. Import each name from the module that defines it. (lint: `codycodes/no-barrel-files`)
- A module that only build-time code may load ends in `.server.ts`, such as `posts.server.ts`. React Router fails the build when client code imports one.
- `app/features/<area>/` holds one area's logic and components. `app/components/` holds UI that two or more pages share. `app/routes/` holds route modules only; `app/routes.ts` registers each one.

## Formatting & Linting

- oxfmt formats (`.oxfmtrc.json`, tabs from `.editorconfig`). Run `pnpm run fmt`; never hand-format.
- oxlint lints (`.oxlintrc.json`), with every category on and type-aware rules. Never biome, prettier, or eslint.
- Lint has no warn tier: `--deny-warnings` fails on a warning.
- Turn a rule off only in `.oxlintrc.json`, with a reason. Suppress one line only with `-- <reason>`. (lint: `codycodes/require-suppression-reason`)
- A `//,` line comment as the first entry of a multi-line import, export, or array keeps oxfmt from joining it onto one line, so each add or remove is a one-line diff. Never delete one. (lint: `codycodes/multiline-exports`)
- In Claude Code, a hook lints each edited file and hands back the findings ([.claude/hooks/lint-edited-file.ts](./.claude/hooks/lint-edited-file.ts)).

## Code Quality

### Readability

- Optimize for readability and changeability, not terseness or cleverness.
- Brace all control flow. (lint: `curly`)
- Name bindings in full: `error` or `event`, not `e`; `element`, not `el`. (lint: `codycodes/descriptive-names`)
- Comments explain _why_, not _what_, in one or two sentences. Describe the code as it is now. Never refer to a previous state or a dropped design.
- Use `function` declarations for named functions. Arrow functions are fine for inline callbacks. (lint: `codycodes/prefer-function-declaration`)
- Use a named options object for any boolean parameter, for 3 or more parameters, and for 2 when the call site is not clear: `fn({ enabled: true })`, not `fn(true)`. (lint: `codycodes/no-boolean-positional-param`, `max-params`)
- No nested ternaries. One ternary is fine. (lint: `no-nested-ternary`)
- Prefer `const` to `let`. Prefer `for…of` to `forEach`. (lint: `prefer-const`, `unicorn/no-array-for-each`)
- Never use a deprecated API. (lint: `typescript/no-deprecated`)

### Error Handling

- Errors are control flow. Every error path recovers, propagates, or stops on purpose. `console.error` is not handling.
- Fail fast on a violated invariant, with a message that names the file or the value. A bad post stops the build; it never renders half a page.
- Await, return, or `void` every promise. (lint: `typescript/no-floating-promises`)

### State & Logic

- [Pure core, effects at the edges](./docs/principles/pure-core-effects-at-the-edges.md): `posts.ts`, `markdown.ts`, and `feeds.ts` are pure. `posts.server.ts`, the route loaders, and `scene.ts` are the edges.
- [Derive, don't sync](./docs/principles/derive-dont-sync.md): slugs come from folder names, URLs from slugs, and every list, feed, and prerender path from the posts. Never keep a second list by hand.

### Abstractions

- Write the least code that does the task ([write less code](./docs/principles/write-less-code.md)). Leave out options and helpers that the task does not need.
- Prefer duplication to the wrong abstraction. Extract shared code only when 3 or more uses share the same behavior, shape, and reason to change.
- Delete dead code and unused files in the same change that makes them dead.

### JSDoc

- Document every exported function, component, type, and Zod field: one summary sentence that states the contract, then units, defaults, and errors.
- Functions and components SHOULD have an `@example` with realistic input and the result.
- Exempt: config files and the React Router route module contract (`default`, `loader`, `meta`, `links`, `ErrorBoundary`).

## TypeScript

- Strict, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` ([tsconfig.json](./tsconfig.json)).
- No `any`; use `unknown` and narrow it. (lint: `typescript/no-explicit-any`)
- Use `type`, not `interface`. (lint: `codycodes/prefer-type-alias`, `typescript/consistent-type-definitions`)
- No non-null assertions (`value!`). Narrow instead. (lint: `typescript/no-non-null-assertion`)
- Use `value == null` and `value != null`. (lint: `eqeqeq`, `codycodes/prefer-null-check`)
- No type assertions (`value as Type`) outside `as const` and a type guard. (lint: `typescript/no-unsafe-type-assertion`)
- A `switch` on a union covers every member. (lint: `typescript/switch-exhaustiveness-check`)
- Model state with unions and narrowing, not optional-property bags.
- Parse untrusted input once, at the boundary, with Zod ([validate at the boundary](./docs/principles/validate-at-the-boundary.md)).

## React

- React 19: `ref` is a prop. Never `forwardRef`, `React.FC`, or `FC`.
- Write UI copy inline, in the JSX that renders it. Never collect strings in a copy module.
- Render conditional JSX with `{condition && <Thing />}`, not a ternary with `null`. Guard a number first (`items.length > 0 && …`). (lint: `codycodes/no-jsx-null-ternary`)
- Never disable a React hooks rule; restructure the code. (lint: `codycodes/no-react-hooks-suppression`)
- Write code that the React Compiler can compile, so turning the compiler on later needs no rewrite. (lint: `react/todo` and the other compiler rules)
- Style with Tailwind classes on the element. Post bodies are bare MDX elements, so `.post-body` in `app/global.css` styles them in one place.
- Use the abyss tokens from `app/global.css` (`text-blush`, `bg-abyss-2`, …). Never write a raw hex color in a component. Teal is for "after" only.
- Use `Link` and `NavLink` from `react-router` for links inside the site, and `<a>` for links off it.

## Performance

- Every page is prerendered. Headings, text, links, and images are in the HTML; never gate them behind an effect or a client-only check.
- Set `width` and `height` on every `<img>`. (lint: `codycodes/img-dimensions`)
- Use `loading="lazy"` only below the fold.
- A decorative scene (WebGL, canvas, animation) loads with a dynamic `import()` after the first paint, and its box keeps the same size before and after, so the load shifts nothing. `app/features/shrimp-tank/` is the pattern.
- An animation loop runs only while its element is on screen, the tab is visible, and something moves. With `prefers-reduced-motion`, motion becomes a small response to input, not a loop.
- A loader returns only the fields that its page renders (`toSummaries`).
- A size or speed claim states its method ([explain the number](./docs/principles/explain-the-number.md)).

## Content

[content/AGENTS.md](./content/AGENTS.md) is the full guide for posts. The code rules:

- `app/features/posts/schema.ts` is the frontmatter contract. A new field needs a reader: a page, a feed, or a twin that uses it.
- Each derived file (the post list, the tag pages, `rss.xml`, `sitemap.xml`, `llms.txt`, and each `.md` twin) comes from `posts.server.ts`. Never hand-write one.
- `app/redirects.ts` is the one redirect table. `server.ts` gives it to the server.

## Testing

- Vitest. Colocate tests as `*.test.ts` or `*.test.tsx`. A component test sets `// @vitest-environment happy-dom`.
- Every test can fail: name the one-line change that turns it red, or delete it. A fix adds a test that fails before the fix.
- Assert what a caller or a reader sees, not internals ([test behavior, not implementation](./docs/principles/test-behavior-not-implementation.md)). No change-detector test that copies a constant.
- No sleeps. (lint: `codycodes/no-sleep-in-tests`)
- No test-only exports, flags, or parameters in production code.

## Writing

Comments, JSDoc, commit messages, PR descriptions, and repo markdown follow ASD-STE100 Simplified Technical English. Load the [`simplified-technical-english`](./.claude/skills/simplified-technical-english/SKILL.md) skill before you write them. Post prose and page copy are Cody's voice and are out of scope.

- Commit subjects use a conventional prefix and the imperative, in ten words or fewer: `feat(posts): add the markdown twin`.
- A PR description has **Why**, **How**, and **Validation**. Never list the changed files.

## Package Management

- Pin every dependency exactly, never `^` or `~`: `pnpm add -E <package>`.
- `pnpm-workspace.yaml` sets `minimumReleaseAge`, so pnpm installs no version that is less than 6 hours old.
- `mise.toml` pins Node (from `.nvmrc`) and pnpm (from `package.json#packageManager`). After a bump, run `mise run relock` and commit `mise.lock` with the pin.
