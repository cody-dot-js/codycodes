import type { BlockContent, DefinitionContent } from "mdast";
import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx-jsx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

import { absoluteUrl } from "~/site.ts";

import type { Post } from "./posts.ts";

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/u;
// Why only the leading run: an MDX post puts its imports above the body, and an import line lower
// down is in a code block.
const MDX_IMPORTS = /^(?:\s*import\s.+\sfrom\s+["'][^"']+["'];?\n)+/u;

type TwinContent = BlockContent | DefinitionContent;

/** The trail that a component with no markdown leaves, so an agent knows that something is there. */
function omitted(node: MdxJsxFlowElement | MdxJsxTextElement) {
	return `<!-- <${node.name ?? "Fragment"} /> omitted in markdown output -->`;
}

/** A JSX string attribute's value. Stops the build when it is absent or an expression. */
function stringAttribute(node: MdxJsxFlowElement, name: string) {
	for (const attribute of node.attributes) {
		if (attribute.type === "mdxJsxAttribute" && attribute.name === name) {
			if (typeof attribute.value === "string") {
				return attribute.value;
			}
			break;
		}
	}
	throw new Error(`<${node.name ?? "Fragment"}> needs a string \`${name}\` for the markdown twin.`);
}

/**
 * The markdown for each kit component, the same as mantle's `.md` twins: an
 * agent cannot run JSX, so each component becomes the markdown that says what
 * it shows. A component with no entry becomes a comment.
 */
const COMPONENTS: Record<string, (node: MdxJsxFlowElement) => TwinContent[]> = {
	BeforeAfter: (node) => [
		{
			type: "paragraph",
			children: [
				{
					type: "text",
					value: `${stringAttribute(node, "label")}: ${stringAttribute(node, "before")} → ${stringAttribute(node, "after")}`,
				},
			],
		},
	],
	// Why a link: the demo is a page of its own, and an agent can fetch it.
	LiveDemo: (node) => [
		{
			type: "paragraph",
			children: [
				{
					type: "link",
					url: absoluteUrl(stringAttribute(node, "src")),
					children: [{ type: "text", value: `Live demo: ${stringAttribute(node, "title")}` }],
				},
			],
		},
	],
	// Why no UTM query: it counts a reader's click from the page, and remark escapes its `&`.
	NgrokCta: (node) => [
		{
			type: "paragraph",
			children: [
				{ type: "strong", children: [{ type: "text", value: stringAttribute(node, "title") }] },
			],
		},
		...node.children,
		{
			type: "paragraph",
			children: [
				{
					type: "link",
					url: "https://dashboard.ngrok.com/",
					children: [{ type: "text", value: "Open the dashboard" }],
				},
				{ type: "text", value: " or " },
				{
					type: "link",
					url: "https://dashboard.ngrok.com/signup",
					children: [{ type: "text", value: "sign up for free" }],
				},
				{ type: "text", value: "." },
			],
		},
	],
	NugSays: (node) => [{ type: "blockquote", children: node.children }],
	ShrimpSays: (node) => [{ type: "blockquote", children: node.children }],
};

/**
 * Makes the markdown twin of a post from its MDX source: a heading block from
 * the frontmatter, then the body as plain markdown. The frontmatter and the
 * imports go, and each JSX component becomes the markdown for what it shows.
 * Code blocks stay as written.
 *
 * @example
 * toMarkdownTwin({ post, source: "---\ntitle: Hello\n---\nHi." });
 * // => "# Hello\n\n> The description.\n\nPublished 2026-11-03 · frontend · https://codycod.es/posts/hello\n\nHi.\n"
 */
export function toMarkdownTwin({ post, source }: { post: Post; source: string }) {
	const tree = unified()
		.use(remarkParse)
		.use(remarkFrontmatter)
		.use(remarkGfm)
		.use(remarkMdx)
		.parse(source);
	// Why only the root: MDX allows the frontmatter and the imports only at the top level.
	tree.children = tree.children.filter((node) => node.type !== "yaml" && node.type !== "mdxjsEsm");
	const body = unified()
		.use(remarkGfm)
		.use(remarkStringify, {
			bullet: "-",
			handlers: {
				// oxlint-disable-next-line max-params -- mdast-util-to-markdown calls each handler with four arguments
				mdxJsxFlowElement(node: MdxJsxFlowElement, parent, state, info) {
					const toMarkdown = node.name == null ? undefined : COMPONENTS[node.name];
					if (toMarkdown == null) {
						return omitted(node);
					}
					return state.handle({ type: "root", children: toMarkdown(node) }, parent, state, info);
				},
				mdxJsxTextElement: omitted,
			},
			rule: "-",
		})
		.stringify(tree)
		.trim();
	const facts = [
		`Published ${post.date}`,
		post.updated != null && `updated ${post.updated}`,
		post.tags.join(", "),
		absoluteUrl(post.href),
	].filter((fact) => fact !== false);
	return `# ${post.title}\n\n> ${post.description}\n\n${facts.join(" · ")}\n\n${body}\n`;
}

const CODE_FENCE = /^```[\s\S]*?^```$/gmu;
const JSX_TAG = /<\/?[A-Z][^>]*>/gu;

/**
 * Counts the words a reader reads in a post: the body without the frontmatter,
 * the imports, the code fences, and the JSX tags. The text inside a component,
 * such as a `NugSays`, counts.
 *
 * @example
 * wordCount("---\ntitle: Hi\n---\nOne two.\n```ts\nconst x = 1;\n```\n"); // => 2
 */
export function wordCount(source: string) {
	const prose = source
		.replace(FRONTMATTER, "")
		.replace(MDX_IMPORTS, "")
		.replaceAll(CODE_FENCE, " ")
		.replaceAll(JSX_TAG, " ");
	return prose.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)?.length ?? 0;
}
