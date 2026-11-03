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
	},
});
