/**
 * Disallows barrel files. A barrel re-exports other modules. One import from it
 * loads every module behind it in each Vitest process and in dev SSR. The
 * reader must also open the barrel to find the code. Import each name from the
 * module that defines it. CONVENTIONS.md → Files & Modules owns the rule.
 *
 * Scope: every `export * from`, and every `export { … } from` in an `index.*`
 * file. A package entry that `package.json#exports` names is the only
 * exception. `.oxlintrc.json` turns the rule off for those files.
 *
 * @example
 * // ❌ Incorrect: components/blade/index.ts
 * export { Blade } from "./blade";
 *
 * // ❌ Incorrect: any file
 * export * from "./colors";
 *
 * // ✅ Correct
 * import { Blade } from "~/components/blade/blade";
 */

import path from "node:path";

const MESSAGE =
	"Do not write barrel files. Import each name from the module that defines it. See CONVENTIONS.md → Files & Modules.";

const noBarrelFiles = {
	meta: {},
	create(context) {
		const isIndex = path.basename(context.filename).startsWith("index.");
		return {
			ExportAllDeclaration(node) {
				context.report({ message: MESSAGE, node });
			},
			ExportNamedDeclaration(node) {
				if (isIndex && node.source) {
					context.report({ message: MESSAGE, node });
				}
			},
		};
	},
};

const plugin = {
	meta: { name: "@ngrok-private" },
	rules: {
		"no-barrel-files": noBarrelFiles,
	},
};

export default plugin;
