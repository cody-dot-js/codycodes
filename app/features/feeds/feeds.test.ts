import { describe, expect, it } from "vitest";

import { parsePosts } from "~/features/posts/posts.ts";

import { llmsTxt, rssFeed, sitemap } from "./feeds.ts";

const posts = parsePosts({
	"/content/posts/tags-and-quotes/post.mdx": {
		title: `Why <b> & "quotes" break feeds`,
		description: "Escape them.",
		date: "2026-11-03",
		updated: "2026-11-04",
		tags: ["frontend"],
	},
});

describe("rssFeed", () => {
	it("escapes XML in the title", () => {
		expect(rssFeed(posts)).toContain(
			"<title>Why &lt;b&gt; &amp; &quot;quotes&quot; break feeds</title>",
		);
	});

	it("dates each item at noon UTC, so no time zone moves it to another day", () => {
		expect(rssFeed(posts)).toContain("<pubDate>Tue, 03 Nov 2026 12:00:00 GMT</pubDate>");
	});
});

describe("llmsTxt", () => {
	it("links each post's markdown twin", () => {
		expect(llmsTxt(posts)).toContain(
			"(https://codydotjs.dev/posts/tags-and-quotes.md): Escape them.",
		);
	});

	it("says so when there are no posts", () => {
		expect(llmsTxt([])).toContain("No posts yet.");
	});
});

describe("sitemap", () => {
	it("dates the home page and the post list by the newest change to a post", () => {
		expect(sitemap(posts)).toContain(
			"<loc>https://codydotjs.dev/</loc><lastmod>2026-11-04</lastmod>",
		);
		expect(sitemap(posts)).toContain(
			"<loc>https://codydotjs.dev/posts</loc><lastmod>2026-11-04</lastmod>",
		);
	});

	it("uses the update date as `lastmod` when a post has one", () => {
		expect(sitemap(posts)).toContain(
			"<loc>https://codydotjs.dev/posts/tags-and-quotes</loc><lastmod>2026-11-04</lastmod>",
		);
	});
});
