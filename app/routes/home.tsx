import { Link } from "react-router";

import { PostList } from "~/components/post-list.tsx";
import { posts } from "~/features/posts/posts.server.ts";
import { toSummaries } from "~/features/posts/summaries.ts";
import { pageMeta } from "~/features/seo/page-meta.ts";
import { ShrimpTank } from "~/features/shrimp-tank/shrimp-tank.tsx";
import { SITE_DESCRIPTION } from "~/site.ts";

import type { Route } from "./+types/home";

export function loader() {
	return { latest: toSummaries(posts.slice(0, 5)) };
}

export const meta: Route.MetaFunction = () =>
	pageMeta({ description: SITE_DESCRIPTION, path: "/" });

export default function Home({ loaderData }: Route.ComponentProps) {
	return (
		<div className="grid gap-16">
			<section className="grid gap-7">
				<header className="grid gap-3.5">
					<p className="font-mono text-xs tracking-widest text-label uppercase">codyaprice.com</p>
					<h1 className="text-[clamp(2.2rem,6vw,3.4rem)] leading-[1.04] font-semibold tracking-tight text-balance">
						cody price
						<br />
						<span className="text-blush">staff frontend engineer at ngrok.</span>
					</h1>
					<p className="max-w-[56ch] text-lg text-label">
						<b className="font-medium text-ink">frontend perf, design systems, agent tooling.</b>{" "}
						receipts + trade-offs. i build mantle and ngrok.com.
					</p>
				</header>
				<ShrimpTank />
			</section>
			<section className="grid gap-5">
				<div className="flex items-baseline justify-between gap-4">
					<h2 className="text-2xl font-semibold tracking-tight">Latest posts</h2>
					<Link to="/posts" className="font-mono text-sm text-label hover:text-ink">
						all posts
					</Link>
				</div>
				<PostList posts={loaderData.latest} empty="The first post is on its way." />
			</section>
		</div>
	);
}
