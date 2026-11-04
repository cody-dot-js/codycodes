import { NugSays } from "~/components/mdx/nug-says.tsx";
import { Nug } from "~/features/nug/nug.tsx";
import { pageMeta } from "~/features/seo/page-meta.ts";

import type { Route } from "./+types/nug";

export const meta: Route.MetaFunction = () =>
	pageMeta({
		title: "Who is Nug?",
		description: "Nug is the shrimp in the ngrok hoodie. He leaves the side notes in posts here.",
		path: "/nug",
		crumbs: [{ name: "Who is Nug?", path: "/nug" }],
	});

export default function WhoIsNug() {
	return (
		<div className="post-body">
			<h1 className="text-4xl font-semibold tracking-tight">Who is Nug?</h1>
			<div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
				<Nug size={176} className="justify-self-center rounded-xl" />
				<div className="grid gap-4">
					<p>
						This is Nug. He&apos;s a shrimp in an ngrok hoodie and a captain&apos;s hat, and
						he&apos;s here to help you shrimp.
					</p>
					<p>
						When a post has a side note you can skip, Nug says it: extra context, some prior art, or
						a link worth the detour. He&apos;s drawn in the same 4×4 dither as the rest of the site.
					</p>
				</div>
			</div>
			<p>A side note from Nug looks like this:</p>
			<NugSays>
				<p>
					<em>To shrimp</em> is a play on <em>to ship</em>, which is why I wear a captain&apos;s
					hat. At ngrok, we like to say we&apos;re shrimping all the time. Click me for a heart.
				</p>
			</NugSays>
		</div>
	);
}
