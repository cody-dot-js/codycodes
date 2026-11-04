import { z } from "zod";

import { TAGS } from "./tags.ts";

/** A post slug: lowercase words joined by `-`. It is the post's folder name. */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, {
	error: "A slug is lowercase words joined by `-`, such as `the-lcp-was-a-blur`.",
});

/**
 * The frontmatter contract of `post.mdx`. The build parses each post once, in
 * `posts.server.ts`, and stops on the first post that breaks it.
 */
export const frontmatterSchema = z.strictObject({
	/** The page title and the `h1`. */
	title: z.string().trim().min(1),
	/** One or two sentences for the post list, the feed, and the link preview. */
	description: z.string().trim().min(1).max(240),
	/** The publish date, as `YYYY-MM-DD`. The site copy is the dated original. */
	date: z.iso.date(),
	/** The date of the last real change, as `YYYY-MM-DD`. Omit it until there is one. */
	updated: z.iso.date().optional(),
	/** One or more topics from `TAGS` in `tags.ts`. */
	tags: z.array(z.enum(TAGS)).min(1),
	/** The link-preview image, in `public/`, and its alt text. Omit it for a text-only preview. */
	image: z
		.strictObject({
			src: z.string().regex(/^\/posts\/[a-z0-9-]+\/[\w-]+\.(?:jpg|png)$/u, {
				error: "An image is a path in `public/`, such as `/posts/<slug>/card.jpg`.",
			}),
			alt: z.string().trim().min(1),
		})
		.optional(),
	/** A 1280x720 MP4 loop of the preview image, in `public/`, for the platforms that play `og:video`. */
	video: z
		.string()
		.regex(/^\/posts\/[a-z0-9-]+\/[\w-]+\.mp4$/u, {
			error: "A video is a path in `public/`, such as `/posts/<slug>/card.mp4`.",
		})
		.optional(),
	/** The URLs of the copies on other platforms, such as the X Article. Add each one after it ships. */
	syndication: z.array(z.url({ protocol: /^https$/u })).default([]),
});

/** The parsed frontmatter of one post. */
export type Frontmatter = z.infer<typeof frontmatterSchema>;
