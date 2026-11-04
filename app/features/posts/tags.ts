/** The topics a post can have. A tag page exists for each one. */
export const TAGS = ["frontend", "perf", "agents", "life"] as const;

/** One post topic. */
export type Tag = (typeof TAGS)[number];

/**
 * Whether a string is a known tag.
 *
 * @example
 * isTag("perf"); // => true
 * isTag("css"); // => false
 */
export function isTag(value: string): value is Tag {
	return TAGS.some((tag) => tag === value);
}
