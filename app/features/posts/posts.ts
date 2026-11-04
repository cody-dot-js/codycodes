import { z } from "zod";

import type { Frontmatter } from "./schema.ts";
import { frontmatterSchema, slugSchema } from "./schema.ts";
import type { Tag } from "./tags.ts";

/** One parsed post, with the URLs that the site derives from its slug. */
export type Post = Frontmatter & {
	slug: string;
	/** The page URL path. */
	href: `/posts/${string}`;
	/** The URL path of the markdown twin, for agents. */
	markdownHref: `/posts/${string}.md`;
	/** The path of `post.mdx` from the repo root. */
	file: string;
};

const POST_PATH = /^\/?(?<file>content\/(?:posts|drafts)\/(?<slug>[^/]+)\/post\.mdx)$/u;

/**
 * Parses the frontmatter of each post module, newest first. It throws on the
 * first file that breaks the contract in `schema.ts`, with the file path and
 * the reason, so a bad post stops the build.
 *
 * @param frontmatterByPath The `frontmatter` export of each `post.mdx`, keyed by its path from the repo root.
 *
 * @example
 * parsePosts({ "/content/posts/hello/post.mdx": { title: "Hello", ... } });
 * // => [{ slug: "hello", href: "/posts/hello", ... }]
 */
export function parsePosts(frontmatterByPath: Record<string, unknown>): Post[] {
	return Object.entries(frontmatterByPath)
		.map(([path, frontmatter]) => {
			const match = POST_PATH.exec(path);
			if (match?.groups?.file == null) {
				throw new Error(`${path}: a post lives at content/posts/<slug>/post.mdx.`);
			}
			const { file } = match.groups;
			const slug = slugSchema.parse(match.groups.slug);
			const result = frontmatterSchema.safeParse(frontmatter);
			if (!result.success) {
				throw new Error(`${file}: the frontmatter is not valid.\n${z.prettifyError(result.error)}`);
			}
			const urls = { href: `/posts/${slug}`, markdownHref: `/posts/${slug}.md` } as const;
			return Object.assign(result.data, urls, { slug, file }) satisfies Post;
		})
		.toSorted((left, right) => right.date.localeCompare(left.date));
}

/**
 * Keeps the posts that have a tag, in their order.
 *
 * @example
 * postsWithTag(posts, "perf"); // => the perf posts, newest first
 */
export function postsWithTag(posts: Post[], tag: Tag) {
	return posts.filter((post) => post.tags.includes(tag));
}
