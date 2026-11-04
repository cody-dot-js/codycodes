import { absoluteUrl } from "~/site.ts";

import type { Post } from "./posts.ts";

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/u;
const MDX_IMPORT = /^import\s.+\sfrom\s+["'][^"']+["'];?\n/gmu;

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
	const body = source.replace(FRONTMATTER, "").replaceAll(MDX_IMPORT, "").trim();
	const facts = [
		`Published ${post.date}`,
		post.updated != null && `updated ${post.updated}`,
		post.tags.join(", "),
		absoluteUrl(post.href),
	].filter((fact) => fact !== false);
	return `# ${post.title}\n\n> ${post.description}\n\n${facts.join(" · ")}\n\n${body}\n`;
}
