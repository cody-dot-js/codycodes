import { Link } from "react-router";

import type { PostSummary } from "~/features/posts/summaries.ts";

/**
 * A list of posts, newest first, or one line that says there are none yet.
 *
 * @example
 * <PostList posts={posts} empty="No perf posts yet." />
 */
export function PostList({ posts, empty }: { posts: PostSummary[]; empty: string }) {
	if (posts.length === 0) {
		return <p className="text-label">{empty}</p>;
	}
	return (
		<ol className="grid border-t border-rule">
			{posts.map((post) => (
				<li key={post.slug} className="grid gap-1 border-b border-rule py-4">
					<p className="flex flex-wrap gap-x-3 font-mono text-xs tracking-wider text-label uppercase">
						<time dateTime={post.date}>{post.date}</time>
						<span>{post.tags.join(" · ")}</span>
					</p>
					<h3 className="text-lg font-semibold tracking-tight">
						<Link to={post.href} className="hover:text-blush">
							{post.title}
						</Link>
					</h3>
					<p className="text-label">{post.description}</p>
				</li>
			))}
		</ol>
	);
}
