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
	if (post == null) {
		throw new Error("The fixture has one post.");
	}

	it("puts the frontmatter facts on top and drops the YAML block and the MDX imports", () => {
		const source = `---\ntitle: Hello\n---\n\nimport { NugSays } from "~/components/mdx/nug-says.tsx";\n\nHi.\n`;

		expect(toMarkdownTwin({ post, source })).toBe(
			`# Hello\n\n> The first post.\n\nPublished 2026-11-03 · frontend, agents · https://codycod.es/posts/hello\n\nHi.\n`,
		);
	});

	it("writes each kit component as the markdown for what it shows", () => {
		const source = `<LiveDemo src="/posts/hello/demo" title="Three IDs" height={162} />\n\n<NugSays>\n  mantle is [open source](https://github.com/ngrok/mantle).\n</NugSays>\n\n<BeforeAfter label="LCP" before="4 s" after="1 s" />\n\n<NgrokCta title="See it in ngrok">\n  Every ID keeps its tail.\n</NgrokCta>\n`;

		expect(toMarkdownTwin({ post, source })).toContain(
			`[Live demo: Three IDs](https://codycod.es/posts/hello/demo)\n\n> mantle is [open source](https://github.com/ngrok/mantle).\n\nLCP: 4 s → 1 s\n\n**See it in ngrok**\n\nEvery ID keeps its tail.\n\n[Open the dashboard](https://dashboard.ngrok.com/) or [sign up for free](https://dashboard.ngrok.com/signup).\n`,
		);
	});

	it("leaves a comment for a component with no markdown, not its JSX", () => {
		const source = `Hi <Badge>new</Badge>.\n\n<Chart data={[1, 2]} />\n`;
		const twin = toMarkdownTwin({ post, source });

		expect(twin).toContain(
			`Hi <!-- <Badge /> omitted in markdown output -->.\n\n<!-- <Chart /> omitted in markdown output -->\n`,
		);
	});

	it("keeps JSX and imports inside a code block", () => {
		const source = `import { LiveDemo } from "~/components/mdx/live-demo.tsx";\n\n\`\`\`tsx\nimport { TruncatedText } from "@ngrok/mantle/truncated-text";\n\n<TruncatedText tail={6} value="ep_123" />\n\`\`\`\n`;

		expect(toMarkdownTwin({ post, source })).toContain(
			`\`\`\`tsx\nimport { TruncatedText } from "@ngrok/mantle/truncated-text";\n\n<TruncatedText tail={6} value="ep_123" />\n\`\`\``,
		);
	});

	it("stops on a kit component that is missing a string attribute", () => {
		expect(() => toMarkdownTwin({ post, source: `<LiveDemo src={demo} title="Hi" />\n` })).toThrow(
			"<LiveDemo> needs a string `src` for the markdown twin.",
		);
	});
});

describe("wordCount", () => {
	it("counts the prose and the text in components, not the code or the tags", () => {
		const source = `---\ntitle: Hi\n---\n\nimport { NugSays } from "~/components/mdx/nug-says.tsx";\n\nOne two, three's.\n\n\`\`\`ts\nconst skipped = "a b c";\n\`\`\`\n\n<NugSays>\n  Four five.\n</NugSays>\n`;

		expect(wordCount(source)).toBe(5);
	});
});
