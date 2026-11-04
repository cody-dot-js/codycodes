import { absoluteUrl } from "~/site.ts";

import type { Post } from "./posts.ts";

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/u;
// Why only the leading run: an MDX post puts its imports above the body, and an import line lower
// down is in a code block that the twin must keep.
const MDX_IMPORTS = /^(?:\s*import\s.+\sfrom\s+["'][^"']+["'];?\n)+/u;

/**
 * Makes the markdown twin of a post from its MDX source: a heading block from
 * the frontmatter, then the body with the frontmatter and the MDX imports
 * removed. JSX in the body stays as written, so a demo shows as its source.
 *
 * @example
 * toMarkdownTwin({ post, source: "---\ntitle: Hello\n---\nHi." });
 * // => "# Hello\n\n> The description.\n\nPublished 2026-11-03 · frontend · https://codycod.es/posts/hello\n\nHi.\n"
 */
export function toMarkdownTwin({ post, source }: { post: Post; source: string }) {
	const body = source.replace(FRONTMATTER, "").replace(MDX_IMPORTS, "").trim();
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
