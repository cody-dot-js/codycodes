import { readFile } from "node:fs/promises";

import type { LoaderFunctionArgs } from "react-router";

import { toMarkdownTwin } from "~/features/posts/markdown.ts";
import { findPost } from "~/features/posts/posts.server.ts";

// Why no `+types` import: with no posts, the route is not in the config, so typegen writes no types.
export async function loader({ url }: LoaderFunctionArgs) {
	const post = findPost(url.pathname.replace(/^\/posts\//u, "").replace(/\.md$/u, ""));
	if (post == null) {
		throw new Response("Not Found", { status: 404 });
	}
	// Why a relative path: the loader runs only in the prerender pass, from the repo root.
	const source = await readFile(post.file, "utf8");
	return new Response(toMarkdownTwin({ post, source }), {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
}
