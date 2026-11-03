import { globSync } from "node:fs";

import { slugSchema } from "./schema.ts";

/** One `post.mdx` on disk. */
export type PostFile = {
	/** The folder name, which is the URL slug. */
	slug: string;
	/** The path from the repo root, such as `content/posts/hello/post.mdx`. */
	file: string;
};

/**
 * Whether the build includes drafts. `pnpm run dev` sets `VITE_DRAFTS=1`, and
 * a production build never does.
 */
export function includeDrafts() {
	return process.env.VITE_DRAFTS === "1";
}

/**
 * Lists the post files that the build publishes, sorted by slug. The route
 * config and the prerender list both read it, so a new folder is a new page
 * with no other edit.
 *
 * @example
 * listPostFiles(); // => [{ slug: "hello", file: "content/posts/hello/post.mdx" }]
 */
export function listPostFiles(): PostFile[] {
	const patterns = includeDrafts()
		? ["content/posts/*/post.mdx", "content/drafts/*/post.mdx"]
		: ["content/posts/*/post.mdx"];
	const files = globSync(patterns)
		.map((file) => ({ slug: slugSchema.parse(file.split("/").at(-2)), file }))
		.toSorted((left, right) => left.slug.localeCompare(right.slug));
	const duplicate = files.find((entry, index) => files[index + 1]?.slug === entry.slug);
	if (duplicate != null) {
		throw new Error(`Two posts use the slug "${duplicate.slug}". Rename one folder.`);
	}
	return files;
}
