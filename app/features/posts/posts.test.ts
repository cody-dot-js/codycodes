import { describe, expect, it } from "vitest";

import { parsePosts, postsWithTag } from "./posts.ts";

const valid = {
	title: "The LCP was a blur",
	description: "A 249 kB placeholder held the hero back.",
	date: "2026-10-28",
	tags: ["perf"],
};

describe("parsePosts", () => {
	it("derives the URLs from the folder name and sorts newest first", () => {
		const posts = parsePosts({
			"/content/posts/older/post.mdx": { ...valid, date: "2026-01-02" },
			"/content/posts/newer/post.mdx": valid,
		});

		expect(posts.map((post) => [post.slug, post.href, post.markdownHref])).toStrictEqual([
			["newer", "/posts/newer", "/posts/newer.md"],
			["older", "/posts/older", "/posts/older.md"],
		]);
		expect(posts[0]?.syndication).toStrictEqual([]);
	});

	it("names the file and the field when the frontmatter breaks the contract", () => {
		expect(() =>
			parsePosts({ "/content/posts/broken/post.mdx": { ...valid, tags: ["css"] } }),
		).toThrow(/content\/posts\/broken\/post\.mdx: the frontmatter is not valid[\s\S]*tags/u);
	});

	it("rejects a key that the contract does not have", () => {
		expect(() =>
			parsePosts({ "/content/posts/extra/post.mdx": { ...valid, draft: true } }),
		).toThrow(/draft/u);
	});

	it("rejects a preview image that is not a post image in public/", () => {
		expect(() =>
			parsePosts({
				"/content/posts/remote/post.mdx": {
					...valid,
					image: { src: "https://example.com/card.jpg", alt: "A card." },
				},
			}),
		).toThrow(/image[\s\S]*public/u);
	});

	it("rejects a folder name that is not a slug", () => {
		expect(() => parsePosts({ "/content/posts/Not_A_Slug/post.mdx": valid })).toThrow(
			/lowercase words/u,
		);
	});
});

describe("postsWithTag", () => {
	it("keeps only the posts with the tag", () => {
		const posts = parsePosts({
			"/content/posts/fast/post.mdx": valid,
			"/content/posts/home/post.mdx": { ...valid, tags: ["life"] },
		});

		expect(postsWithTag(posts, "life").map((post) => post.slug)).toStrictEqual(["home"]);
	});
});
