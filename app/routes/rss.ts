import { rssFeed } from "~/features/feeds/feeds.ts";
import { posts } from "~/features/posts/posts.server.ts";

export function loader() {
	return new Response(rssFeed(posts), {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}
