import { NavLink } from "react-router";

import { TAGS } from "~/features/posts/tags.ts";

/**
 * The links to each tag page, with the current one marked.
 *
 * @example
 * <TagNav />
 */
export function TagNav() {
	return (
		<nav aria-label="Tags" className="flex flex-wrap gap-2 font-mono text-sm">
			<NavLink
				to="/posts"
				end
				className="rounded-full border border-rule px-3 py-0.5 text-label hover:text-ink aria-[current=page]:border-blush aria-[current=page]:text-blush"
			>
				all
			</NavLink>
			{TAGS.map((tag) => (
				<NavLink
					key={tag}
					to={`/posts/tags/${tag}`}
					className="rounded-full border border-rule px-3 py-0.5 text-label hover:text-ink aria-[current=page]:border-blush aria-[current=page]:text-blush"
				>
					{tag}
				</NavLink>
			))}
		</nav>
	);
}
