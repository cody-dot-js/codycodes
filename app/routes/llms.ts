import { llmsTxt } from "~/features/feeds/feeds.ts";
import { posts } from "~/features/posts/posts.server.ts";

export function loader() {
	return new Response(llmsTxt(posts), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
}
