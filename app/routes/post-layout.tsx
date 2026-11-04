import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, Outlet, data, useLoaderData } from "react-router";

import { findPost } from "~/features/posts/posts.server.ts";
import { pageMeta } from "~/features/seo/page-meta.ts";

// Why no `+types` import: with no posts, the route is not in the config, so typegen writes no types.
export function loader({ url }: LoaderFunctionArgs) {
	const post = findPost(url.pathname.replace(/^\/posts\//u, ""));
	if (post == null) {
		throw data(null, { status: 404, statusText: "Not Found" });
	}
	const { date, description, href, image, markdownHref, syndication, tags, title, updated } = post;
	return { date, description, href, image, markdownHref, syndication, tags, title, updated };
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) =>
	loaderData == null
		? []
		: pageMeta({
				title: loaderData.title,
				description: loaderData.description,
				path: loaderData.href,
				type: "article",
				image: loaderData.image,
				extra: [
					{ property: "article:published_time", content: loaderData.date },
					{
						tagName: "link",
						rel: "alternate",
						type: "text/markdown",
						href: loaderData.markdownHref,
					},
				],
			});

export default function PostLayout() {
	const post = useLoaderData<typeof loader>();
	return (
		<article className="grid gap-10">
			<header className="grid gap-4">
				<p className="flex flex-wrap gap-x-3 font-mono text-xs tracking-wider text-label uppercase">
					<time dateTime={post.date}>{post.date}</time>
					{post.updated != null && (
						<span>
							updated <time dateTime={post.updated}>{post.updated}</time>
						</span>
					)}
					{post.tags.map((tag) => (
						<Link key={tag} to={`/posts/tags/${tag}`} className="hover:text-ink">
							{tag}
						</Link>
					))}
				</p>
				<h1 className="text-[clamp(2rem,5vw,3rem)] leading-[1.08] font-semibold tracking-tight text-balance">
					{post.title}
				</h1>
				<p className="max-w-[60ch] text-lg text-label">{post.description}</p>
			</header>
			<div className="post-body">
				<Outlet />
			</div>
			<footer className="grid gap-2 border-t border-rule pt-5 font-mono text-sm text-label">
				{post.syndication.length > 0 && (
					<p>
						Also on:{" "}
						{post.syndication.map((url) => (
							<a key={url} href={url} className="mr-3 text-blush underline">
								{URL.parse(url)?.hostname ?? url}
							</a>
						))}
					</p>
				)}
				<p>
					<a href={post.markdownHref} className="hover:text-ink">
						Read this post as markdown
					</a>
				</p>
			</footer>
		</article>
	);
}
