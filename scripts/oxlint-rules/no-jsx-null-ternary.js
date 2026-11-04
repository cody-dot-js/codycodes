/**
 * Disallows a ternary with a `null` arm as a JSX child. Render conditional JSX
 * with `&&`, so the reader does not parse an arm that renders nothing.
 * CONVENTIONS.md → Readability & Maintainability owns the rule.
 *
 * Scope: only an expression container that is a JSX child. A prop value such as
 * `icon={active ? <CheckIcon /> : null}` can need an explicit `null`.
 *
 * @example
 * // ❌ Incorrect
 * <div>{isOpen ? <Panel /> : null}</div>
 * <div>{isOpen ? null : <Panel />}</div>
 *
 * // ✅ Correct
 * <div>{isOpen && <Panel />}</div>
 * <div>{!isOpen && <Panel />}</div>
 * <div>{isOpen ? <Panel /> : <Placeholder />}</div>
 */

/** Whether the node is the `null` literal. */
function isNullLiteral(node) {
	return node.type === "Literal" && node.value == null && node.raw === "null";
}

const noJsxNullTernary = {
	meta: {},
	create(context) {
		return {
			JSXExpressionContainer(node) {
				if (node.parent?.type !== "JSXElement" && node.parent?.type !== "JSXFragment") {
					return;
				}
				const expression = node.expression;
				if (expression.type !== "ConditionalExpression") {
					return;
				}
				if (isNullLiteral(expression.alternate) || isNullLiteral(expression.consequent)) {
					context.report({
						message:
							"Render conditional JSX with `{condition && <Thing />}`, not a ternary with a `null` arm. Guard a non-boolean condition first, such as `items.length > 0 && …`.",
						node: expression,
					});
				}
			},
		};
	},
};

const plugin = {
	meta: { name: "@ngrok-private" },
	rules: {
		"no-jsx-null-ternary": noJsxNullTernary,
	},
};

export default plugin;
