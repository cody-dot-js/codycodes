import { Link, NavLink, Outlet } from "react-router";

import { X_HANDLE } from "~/site.ts";

export default function SiteLayout() {
	return (
		<div className="mx-auto grid min-h-dvh max-w-[920px] grid-rows-[auto_1fr_auto] gap-12 px-[max(16px,env(safe-area-inset-left))] py-8">
			<header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
				<Link to="/" className="font-mono text-sm tracking-wide text-ink">
					codycod.es
				</Link>
				<nav aria-label="Main" className="flex gap-5 font-mono text-sm text-label">
					{/* Why NavLink: it sets `aria-current="page"`, which the class reads. */}
					<NavLink to="/posts" className="aria-[current=page]:text-blush hover:text-ink">
						posts
					</NavLink>
					<NavLink to="/about" className="aria-[current=page]:text-blush hover:text-ink">
						about
					</NavLink>
					<NavLink to="/now" className="aria-[current=page]:text-blush hover:text-ink">
						now
					</NavLink>
				</nav>
			</header>
			<main id="main">
				<Outlet />
			</main>
			<footer className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5 font-mono text-sm text-label">
				<span>#shrimpfluencing</span>
				<span className="flex flex-wrap gap-5">
					<a href={`https://x.com/${X_HANDLE}`} className="hover:text-ink">
						@{X_HANDLE}
					</a>
					<a href="https://github.com/cody-dot-js" className="hover:text-ink">
						github
					</a>
					<a href="/rss.xml" className="hover:text-ink">
						rss
					</a>
					<a href="/llms.txt" className="hover:text-ink">
						llms.txt
					</a>
				</span>
			</footer>
		</div>
	);
}
