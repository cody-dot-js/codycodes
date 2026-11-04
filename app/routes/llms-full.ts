import { readFile } from "node:fs/promises";

import { toMarkdownTwin } from "~/features/posts/markdown.ts";
import { posts } from "~/features/posts/posts.server.ts";
import { SITE_DESCRIPTION, SITE_NAME } from "~/site.ts";

// Why: an answer engine can read every post in one request, as `llms.txt` lists them. See https://llmstxt.org.
export async function loader() {
	// Why a relative path: the loader runs only in the prerender pass, from the repo root.
	const twins = await Promise.all(
		posts.map(async (post) => toMarkdownTwin({ post, source: await readFile(post.file, "utf8") })),
	);
	const body = [`# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n`, ...twins].join("\n---\n\n");
	return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
