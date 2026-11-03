import { PostList } from "~/components/post-list.tsx";
import { TagNav } from "~/components/tag-nav.tsx";
import { posts } from "~/features/posts/posts.server.ts";
import { toSummaries } from "~/features/posts/summaries.ts";
import { pageMeta } from "~/features/seo/page-meta.ts";

import type { Route } from "./+types/posts";

export function loader() {
	return { posts: toSummaries(posts) };
}

export const meta: Route.MetaFunction = () =>
	pageMeta({
		title: "Posts",
		description: "Every post on codyaprice.com, newest first.",
		path: "/posts",
	});

export default function Posts({ loaderData }: Route.ComponentProps) {
	return (
		<div className="grid gap-8">
			<header className="grid gap-4">
				<h1 className="text-4xl font-semibold tracking-tight">Posts</h1>
				<TagNav />
			</header>
			<PostList posts={loaderData.posts} empty="No posts yet. The first one is on its way." />
		</div>
	);
}
