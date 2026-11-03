// Custom oxlint rules for the conventions that no built-in rule checks. They come from the
// app-server, mantle, and frontend repos.

import descriptiveNames from "./oxlint-rules/descriptive-names.js";
import imgDimensions from "./oxlint-rules/img-dimensions.js";
import multilineExports from "./oxlint-rules/multiline-exports.js";
import noBarrelFiles from "./oxlint-rules/no-barrel-files.js";
import noBooleanPositionalParam from "./oxlint-rules/no-boolean-positional-param.js";
import noJsxNullTernary from "./oxlint-rules/no-jsx-null-ternary.js";
import noReactHooksSuppression from "./oxlint-rules/no-react-hooks-suppression.js";
import noSleepInTests from "./oxlint-rules/no-sleep-in-tests.js";
import preferFunctionDeclaration from "./oxlint-rules/prefer-function-declaration.js";
import preferNullCheck from "./oxlint-rules/prefer-null-check.js";
import preferTypeAlias from "./oxlint-rules/prefer-type-alias.js";
import preferUrlParse from "./oxlint-rules/prefer-url-parse.js";
import requireSuppressionReason from "./oxlint-rules/require-suppression-reason.js";
import testAssertions from "./oxlint-rules/test-assertions.js";

const plugin = {
	meta: { name: "codycodes" },
	rules: {
		...descriptiveNames,
		...imgDimensions.rules,
		...multilineExports,
		...noBarrelFiles.rules,
		...noBooleanPositionalParam,
		...noJsxNullTernary.rules,
		...noReactHooksSuppression.rules,
		...noSleepInTests,
		...preferFunctionDeclaration,
		...preferNullCheck,
		...preferTypeAlias.rules,
		...preferUrlParse,
		...requireSuppressionReason,
		...testAssertions,
	},
};

export default plugin;
