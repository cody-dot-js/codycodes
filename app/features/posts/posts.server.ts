import { includeDrafts } from "./files.server.ts";
import type { Post } from "./posts.ts";
import { parsePosts } from "./posts.ts";

// Why eager: loaders run only at build time (`ssr: false`), so the index loads once per build and
// never reaches the client bundle.
const published = import.meta.glob<unknown>("/content/posts/*/post.mdx", {
	import: "frontmatter",
	eager: true,
});
const drafts = import.meta.glob<unknown>("/content/drafts/*/post.mdx", {
	import: "frontmatter",
	eager: true,
});

/** Every post that the build publishes, newest first. Drafts join only when `includeDrafts()` is true. */
export const posts: Post[] = parsePosts(includeDrafts() ? { ...published, ...drafts } : published);

/**
 * Finds one post by its slug.
 *
 * @example
 * findPost("hello")?.title; // => "Hello"
 */
export function findPost(slug: string) {
	return posts.find((post) => post.slug === slug);
}
