import { globSync } from "node:fs";
import { basename } from "node:path";

import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

import { listPostFiles } from "./features/posts/files.server.ts";

const postFiles = listPostFiles();

export default [
	//,
	layout("routes/site-layout.tsx", [
		index("routes/home.tsx"),
		route("posts", "routes/posts.tsx"),
		route("posts/tags/:tag", "routes/posts-tag.tsx"),
		route("about", "routes/about.tsx"),
		route("now", "routes/now.tsx"),
		route("nug", "routes/nug.tsx"),
		// Why one route for each post: the route module is the MDX file, so the router loads the
		// post before it renders. The prerendered HTML holds the whole post. Why only with posts:
		// a layout with no child routes would only add a loader that no path reaches.
		...(postFiles.length > 0
			? [
					layout(
						"routes/post-layout.tsx",
						postFiles.map((post) =>
							route(`posts/${post.slug}`, `../${post.file}`, { id: `post/${post.slug}` }),
						),
					),
				]
			: []),
		route("*", "routes/not-found.tsx"),
	]),
	// Why outside the site layout: a post embeds its demos in frames, so a demo has no site chrome.
	// Each `demo*.tsx` next to a post is a page at `/posts/<slug>/<file name>`.
	...postFiles.flatMap((post) =>
		globSync(post.file.replace(/post\.mdx$/u, "demo*.tsx")).map((file) => {
			const name = basename(file, ".tsx");
			return route(`posts/${post.slug}/${name}`, `../${file}`, { id: `post-${name}/${post.slug}` });
		}),
	),
	...postFiles.map((post) =>
		route(`posts/${post.slug}.md`, "routes/post-markdown.ts", { id: `post-markdown/${post.slug}` }),
	),
	route("rss.xml", "routes/rss.ts"),
	route("llms.txt", "routes/llms.ts"),
	route("llms-full.txt", "routes/llms-full.ts"),
	route("sitemap.xml", "routes/sitemap.ts"),
	route("robots.txt", "routes/robots.ts"),
] satisfies RouteConfig;
