import { pageMeta } from "~/features/seo/page-meta.ts";

import type { Route } from "./+types/about";

export const meta: Route.MetaFunction = () =>
	pageMeta({
		title: "About",
		description: "Cody Price is a staff frontend engineer at ngrok.",
		path: "/about",
	});

export default function About() {
	return (
		<div className="post-body">
			<h1 className="text-4xl font-semibold tracking-tight">Hey y’all 👋</h1>
			<p>
				I’m <strong>Cody Price</strong>, a staff frontend engineer at{" "}
				<a href="https://ngrok.com">ngrok</a>. I build <a href="https://mantle.ngrok.com">mantle</a>
				, ngrok’s design system, and ngrok.com.
			</p>
			<p>
				I care about frontend performance, design systems, and tools that let agents do real work in
				a codebase. I post the receipts and the trade-offs here and on{" "}
				<a href="https://x.com/codydotjs">X</a>.
			</p>
			<h2>I believe in…</h2>
			<ul>
				<li>Doing what is right.</li>
				<li>Always giving everything your best effort.</li>
				<li>Delivering on promises.</li>
				<li>Sticking up for those that cannot defend themselves.</li>
				<li>Pursuing my passions.</li>
				<li>Holding true to my moral and ethical principles.</li>
			</ul>
		</div>
	);
}
