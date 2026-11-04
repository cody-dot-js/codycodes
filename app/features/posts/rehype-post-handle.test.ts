import type { Root } from "hast";
import { describe, expect, it } from "vitest";

import { tocOf } from "./rehype-post-handle.ts";

describe("tocOf", () => {
	it("lists the top-level h2 and h3 headings with their ids and text", () => {
		const tree: Root = {
			type: "root",
			children: [
				{
					type: "element",
					tagName: "h2",
					properties: { id: "use-it" },
					children: [{ type: "text", value: "Use it" }],
				},
				{
					type: "element",
					tagName: "p",
					properties: {},
					children: [{ type: "text", value: "Body." }],
				},
				{
					type: "element",
					tagName: "h3",
					properties: { id: "why-not-flex" },
					children: [
						{ type: "text", value: "Why not " },
						{
							type: "element",
							tagName: "code",
							properties: {},
							children: [{ type: "text", value: "flex" }],
						},
					],
				},
				{
					type: "element",
					tagName: "h4",
					properties: { id: "deep" },
					children: [{ type: "text", value: "Deep" }],
				},
			],
		};

		expect(tocOf(tree)).toStrictEqual([
			{ id: "use-it", text: "Use it", level: 2 },
			{ id: "why-not-flex", text: "Why not flex", level: 3 },
		]);
	});
});
