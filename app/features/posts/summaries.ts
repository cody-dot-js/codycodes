import type { Post } from "./posts.ts";

/** The fields of a post that a list row shows. */
export type PostSummary = Pick<Post, "date" | "description" | "href" | "slug" | "tags" | "title">;

/**
 * Keeps only the fields that a list row shows, so a loader sends less data to the client.
 *
 * @example
 * toSummaries(posts); // => [{ slug, href, title, description, date, tags }]
 */
export function toSummaries(posts: Post[]): PostSummary[] {
	return posts.map(({ date, description, href, slug, tags, title }) => ({
		date,
		description,
		href,
		slug,
		tags,
		title,
	}));
}
