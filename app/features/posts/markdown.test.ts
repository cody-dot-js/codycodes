import { describe, expect, it } from "vitest";

import { toMarkdownTwin } from "./markdown.ts";
import { parsePosts } from "./posts.ts";

const [post] = parsePosts({
	"/content/posts/hello/post.mdx": {
		title: "Hello",
		description: "The first post.",
		date: "2026-11-03",
		tags: ["frontend", "agents"],
	},
});

describe("toMarkdownTwin", () => {
	it("puts the frontmatter facts on top and drops the YAML block and the MDX imports", () => {
		if (post == null) {
			throw new Error("The fixture has one post.");
		}
		const source = `---\ntitle: Hello\n---\n\nimport { BeforeAfter } from "~/components/mdx/before-after.tsx";\n\nHi.\n\n<BeforeAfter label="LCP" before="4 s" after="1 s" />\n`;

		expect(toMarkdownTwin({ post, source })).toBe(
			`# Hello\n\n> The first post.\n\nPublished 2026-11-03 · frontend, agents · https://codyaprice.com/posts/hello\n\nHi.\n\n<BeforeAfter label="LCP" before="4 s" after="1 s" />\n`,
		);
	});
});
