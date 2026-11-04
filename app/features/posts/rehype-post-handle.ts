import type { ElementContent, Root } from "hast";
import { valueToEstree } from "estree-util-value-to-estree";

/** One heading in a post's table of contents. */
export type TocEntry = {
	/** The heading's `id`, which `rehype-slug` sets. */
	id: string;
	/** The heading's text. */
	text: string;
	/** 2 for an `h2`, 3 for an `h3`. The title is the page's only `h1`. */
	level: 2 | 3;
};

const LEVELS: Record<string, TocEntry["level"]> = { h2: 2, h3: 3 };

/** The text of an element and its descendants. */
function textOf(nodes: ElementContent[]): string {
	return nodes
		.map((node) => {
			if (node.type === "text") {
				return node.value;
			}
			return node.type === "element" ? textOf(node.children) : "";
		})
		.join("");
}

/**
 * Lists the top-level `h2` and `h3` headings of a post, in order.
 *
 * @example
 * tocOf(tree); // => [{ id: "why-not-flex", text: "Why not flex", level: 2 }]
 */
export function tocOf(tree: Root): TocEntry[] {
	return tree.children.flatMap((node) => {
		const level = node.type === "element" ? LEVELS[node.tagName] : undefined;
		const id = node.type === "element" ? node.properties.id : undefined;
		if (node.type !== "element" || level == null || typeof id !== "string") {
			return [];
		}
		return [{ id, text: textOf(node.children).trim(), level }];
	});
}

/**
 * A rehype plugin that adds `export const handle = { toc }` to each post. Run
 * it after `rehype-slug`, so each heading has its `id`.
 *
 * Why `handle`: a post is a route module, so the layout reads the toc from
 * `useMatches()`, and the prerendered HTML has the table of contents.
 */
export function rehypePostHandle() {
	return (tree: Root) => {
		tree.children.unshift({
			type: "mdxjsEsm",
			value: "",
			data: {
				estree: {
					type: "Program",
					sourceType: "module",
					body: [
						{
							type: "ExportNamedDeclaration",
							specifiers: [],
							attributes: [],
							source: null,
							declaration: {
								type: "VariableDeclaration",
								kind: "const",
								declarations: [
									{
										type: "VariableDeclarator",
										id: { type: "Identifier", name: "handle" },
										init: valueToEstree({ toc: tocOf(tree) }),
									},
								],
							},
						},
					],
				},
			},
		});
	};
}
