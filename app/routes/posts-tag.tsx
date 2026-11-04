import { data } from "react-router";

import { PostList } from "~/components/post-list.tsx";
import { TagNav } from "~/components/tag-nav.tsx";
import { postsWithTag } from "~/features/posts/posts.ts";
import { posts } from "~/features/posts/posts.server.ts";
import { toSummaries } from "~/features/posts/summaries.ts";
import { isTag } from "~/features/posts/tags.ts";
import { postListJsonLd } from "~/features/seo/json-ld.ts";
import { pageMeta } from "~/features/seo/page-meta.ts";

import type { Route } from "./+types/posts-tag";

export function loader({ params }: Route.LoaderArgs) {
	if (!isTag(params.tag)) {
		throw data(null, { status: 404, statusText: "Not Found" });
	}
	return { tag: params.tag, posts: toSummaries(postsWithTag(posts, params.tag)) };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
	pageMeta({
		title: `${loaderData.tag} posts`,
		description: `Posts on codycod.es tagged ${loaderData.tag}, newest first.`,
		path: `/posts/tags/${loaderData.tag}`,
		pageType: "CollectionPage",
		crumbs: [
			{ name: "Posts", path: "/posts" },
			{ name: loaderData.tag, path: `/posts/tags/${loaderData.tag}` },
		],
		pageSchema: { mainEntity: postListJsonLd(loaderData.posts) },
		// Why: a tag with no posts is a thin page, so it stays out of search until it has one.
		noindex: loaderData.posts.length === 0,
	});

export default function PostsTag({ loaderData }: Route.ComponentProps) {
	return (
		<div className="grid gap-8">
			<header className="grid gap-4">
				<h1 className="text-4xl font-semibold tracking-tight">
					Posts tagged <span className="text-blush">{loaderData.tag}</span>
				</h1>
				<TagNav />
			</header>
			<PostList posts={loaderData.posts} empty={`No ${loaderData.tag} posts yet.`} />
		</div>
	);
}
