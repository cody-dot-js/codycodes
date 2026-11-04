import WhoIsNug from "~/features/nug/who-is-nug.mdx";
import { pageMeta } from "~/features/seo/page-meta.ts";

import type { Route } from "./+types/nug";

export const meta: Route.MetaFunction = () =>
	pageMeta({
		title: "Who is Nug?",
		description: "Nug is the shrimp in the ngrok hoodie. He leaves the side notes in posts here.",
		path: "/nug",
		crumbs: [{ name: "Who is Nug?", path: "/nug" }],
	});

// Why MDX for the copy: the page gets the same markdown as a post, footnotes included.
export default function WhoIsNugPage() {
	return (
		<div className="post-body">
			<h1 className="text-4xl font-semibold tracking-tight">Who is Nug?</h1>
			<WhoIsNug />
		</div>
	);
}
