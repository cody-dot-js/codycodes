import { pageMeta } from "~/features/seo/page-meta.ts";

import type { Route } from "./+types/now";

export const meta: Route.MetaFunction = () =>
	pageMeta({
		title: "Now",
		description: "What Cody Price is shipping this month.",
		path: "/now",
		crumbs: [{ name: "Now", path: "/now" }],
	});

export default function Now() {
	return (
		<div className="post-body">
			<h1 className="text-4xl font-semibold tracking-tight">Now</h1>
			<p className="font-mono text-xs tracking-wider text-label uppercase">
				Updated <time dateTime="2026-11-03">2026-11-03</time>
			</p>
			<ul>
				<li>Rebuilding this site: MDX posts, the abyss brand, and a shrimp that swims laps.</li>
				<li>
					Shipping <a href="https://github.com/ngrok/app-server">@ngrok/app-server</a>, which this
					site moves to after 0.3.0.
				</li>
			</ul>
			<p>
				Daily notes go to <a href="https://x.com/codydotjs">X</a>.
			</p>
		</div>
	);
}
