import { sitemap } from "~/features/feeds/feeds.ts";
import { posts } from "~/features/posts/posts.server.ts";

export function loader() {
	return new Response(sitemap(posts), {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
}
