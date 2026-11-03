import { Link } from "react-router";

import { pageMeta } from "~/features/seo/page-meta.ts";

import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = () => [
	...pageMeta({ title: "Not found", description: "This page does not exist.", path: "/404" }),
	{ name: "robots", content: "noindex" },
];

export default function NotFound() {
	return (
		<div className="grid gap-4 py-16">
			<p className="font-mono text-xs tracking-widest text-label uppercase">404</p>
			<h1 className="text-4xl font-semibold tracking-tight">Nothing down here.</h1>
			<p className="text-label">
				This page swam off. Try the{" "}
				<Link to="/posts" className="text-blush underline">
					posts
				</Link>{" "}
				or go{" "}
				<Link to="/" className="text-blush underline">
					home
				</Link>
				.
			</p>
		</div>
	);
}
