import { describe, expect, it } from "vitest";

import { pageMeta } from "./page-meta.ts";

function find(
	tags: ReturnType<typeof pageMeta>,
	key: string,
	value: string,
): Record<string, unknown> | undefined {
	return tags.find((tag) => (tag as Record<string, unknown>)[key] === value);
}

describe("pageMeta", () => {
	it("gives an indexed page the site card, the robots rules, and a graph of the site, Cody, and the page", () => {
		const tags = pageMeta({
			title: "Posts",
			description: "Every post.",
			path: "/posts",
			pageType: "CollectionPage",
		});

		expect(find(tags, "property", "og:image")?.content).toBe("https://codycod.es/og.jpg");
		expect(find(tags, "name", "robots")?.content).toContain("max-image-preview:large");
		const script = tags.find((tag) => "script:ld+json" in tag) as
			| { "script:ld+json": { "@graph": { "@type": string }[] } }
			| undefined;
		const graph = script?.["script:ld+json"] ?? { "@graph": [] };
		expect(graph["@graph"].map((node) => node["@type"])).toStrictEqual([
			"WebSite",
			"Person",
			"CollectionPage",
		]);
	});

	it("keeps a noindex page out of search, with no JSON-LD", () => {
		const tags = pageMeta({
			title: "Not found",
			description: "Gone.",
			path: "/404",
			noindex: true,
		});

		expect(find(tags, "name", "robots")?.content).toBe("noindex, follow");
		expect(tags.some((tag) => "script:ld+json" in tag)).toBe(false);
	});
});
