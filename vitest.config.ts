import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: { "~": `${import.meta.dirname}/app` },
	},
	test: {
		include: ["app/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
		// Why: a component test sets `@vitest-environment happy-dom` in its docblock; the rest need only Node.
		environment: "node",
		testTimeout: 15_000,
		// Why: each test starts with clean mocks, stubs, and env, so no test tears them down by hand.
		// The `codycodes/no-config-teardown` lint rule relies on these four.
		clearMocks: true,
		restoreMocks: true,
		unstubEnvs: true,
		unstubGlobals: true,
	},
});
