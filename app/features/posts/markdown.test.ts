import { describe, expect, it } from "vitest";

import { toMarkdownTwin, wordCount } from "./markdown.ts";
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
			`# Hello\n\n> The first post.\n\nPublished 2026-11-03 · frontend, agents · https://codycod.es/posts/hello\n\nHi.\n\n<BeforeAfter label="LCP" before="4 s" after="1 s" />\n`,
		);
	});

	it("keeps an import inside a code block", () => {
		if (post == null) {
			throw new Error("The fixture has one post.");
		}
		const source = `---\ntitle: Hello\n---\n\nimport { LiveDemo } from "~/components/mdx/live-demo.tsx";\n\n\`\`\`tsx\nimport { TruncatedText } from "@ngrok/mantle/truncated-text";\n\`\`\`\n`;

		expect(toMarkdownTwin({ post, source })).toContain(
			`\`\`\`tsx\nimport { TruncatedText } from "@ngrok/mantle/truncated-text";\n\`\`\``,
		);
	});
});

describe("wordCount", () => {
	it("counts the prose and the text in components, not the code or the tags", () => {
		const source = `---\ntitle: Hi\n---\n\nimport { NugSays } from "~/components/mdx/nug-says.tsx";\n\nOne two, three's.\n\n\`\`\`ts\nconst skipped = "a b c";\n\`\`\`\n\n<NugSays>\n  Four five.\n</NugSays>\n`;

		expect(wordCount(source)).toBe(5);
	});
});
