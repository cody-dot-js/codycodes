import { readFile } from "node:fs/promises";

import { MDXProvider } from "@mdx-js/react";
import { useMemo } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, Outlet, data, useLoaderData, useMatches } from "react-router";
import { z } from "zod";

import { CodeBlock } from "~/components/mdx/code-block.tsx";

import { wordCount } from "~/features/posts/markdown.ts";
import { findPost } from "~/features/posts/posts.server.ts";
import { blogPostingJsonLd } from "~/features/seo/json-ld.ts";
import { pageMeta } from "~/features/seo/page-meta.ts";
import { SITE_IMAGE, absoluteUrl } from "~/site.ts";
import { TableOfContents } from "~/features/toc/table-of-contents.tsx";

/** The MDX elements that a post renders with a component. */
const MDX_COMPONENTS = { pre: CodeBlock };

/** Where the table of contents shows: the `lg` breakpoint, beside the post. */
const TOC_MEDIA = "(min-width: 64rem)";

/** The `handle` that `rehypePostHandle` adds to each post module. */
const postHandleSchema = z.object({
	toc: z.array(z.object({ id: z.string(), text: z.string(), level: z.literal([2, 3]) })),
});

// Why no `+types` import: with no posts, the route is not in the config, so typegen writes no types.
export async function loader({ url }: LoaderFunctionArgs) {
	const post = findPost(url.pathname.replace(/^\/posts\//u, ""));
	if (post == null) {
		throw data(null, { status: 404, statusText: "Not Found" });
	}
	const { date, description, href, image, markdownHref, syndication, tags, title, updated, video } =
		post;
	return {
		date,
		description,
		href,
		image,
		markdownHref,
		syndication,
		tags,
		title,
		updated,
		video,
		// Why a relative path: the loader runs only in the prerender pass, from the repo root.
		wordCount: wordCount(await readFile(post.file, "utf8")),
	};
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
				video: loaderData.video,
				crumbs: [
					{ name: "Posts", path: "/posts" },
					{ name: loaderData.title, path: loaderData.href },
				],
				schema: [
					blogPostingJsonLd({
						post: loaderData,
						wordCount: loaderData.wordCount,
						image: absoluteUrl(loaderData.image?.src ?? SITE_IMAGE.src),
					}),
				],
				extra: [
					{ property: "article:published_time", content: loaderData.date },
					{ property: "article:modified_time", content: loaderData.updated ?? loaderData.date },
					{ property: "article:author", content: absoluteUrl("/about") },
					...loaderData.tags.map((tag) => ({ property: "article:tag", content: tag })),
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
	const matches = useMatches();
	// Why the last match: the post module is the leaf route, and its `handle` holds the toc.
	// Why useMemo: zod returns a new array on each parse, and the toc's scroll spy restarts on a new array.
	const toc = useMemo(
		() => postHandleSchema.safeParse(matches.at(-1)?.handle).data?.toc ?? [],
		[matches],
	);
	return (
		<article className="grid gap-10">
			<header className="grid gap-4">
				<p className="flex flex-wrap gap-x-3 font-mono text-xs tracking-wider text-label uppercase">
					{/* Why a byline: the page names its author, as its JSON-LD does. */}
					<Link to="/about" rel="author" className="hover:text-ink">
						Cody Price
					</Link>
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
			<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_11rem]">
				<div className="post-body">
					<MDXProvider components={MDX_COMPONENTS}>
						<Outlet />
					</MDXProvider>
				</div>
				<aside className="hidden lg:block">
					<TableOfContents entries={toc} media={TOC_MEDIA} />
				</aside>
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
