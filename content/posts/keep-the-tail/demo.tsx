import { TooltipProvider } from "@ngrok/mantle/tooltip";
import { TruncatedText } from "@ngrok/mantle/truncated-text";
import type { LinksFunction, MetaFunction } from "react-router";

import demoUrl from "./demo.css?url";

// Why these IDs: they are the sample IDs in mantle's docs. Each one differs only in its last six characters.
const IDS = ["ep_2abcdEFGhijKL123456", "ep_2abcdEFGhijKL789012", "ep_2abcdEFGhijKL345678"] as const;

export const links: LinksFunction = () => [{ rel: "stylesheet", href: demoUrl }];

// Why noindex: the post embeds this page in a frame. On its own it is a fragment of the post.
export const meta: MetaFunction = () => [
	{ title: "TruncatedText demo" },
	{ name: "robots", content: "noindex" },
];

export default function TruncatedTextDemo() {
	return (
		<TooltipProvider>
			{/* Why invert-theme: mantle's dark tokens apply to this subtree. The site's dark ground shows through. */}
			<main className="invert-theme grid grid-cols-2 gap-3 p-3 font-mono text-sm text-body">
				<section className="grid grid-cols-1 content-start gap-2 rounded-lg border border-card p-3">
					<h2 className="text-xs text-muted">CSS truncate</h2>
					<ul className="grid grid-cols-1 gap-1.5">
						{IDS.map((id) => (
							<li key={id} className="truncate">
								{id}
							</li>
						))}
					</ul>
				</section>
				<section className="grid grid-cols-1 content-start gap-2 rounded-lg border border-accent-600 p-3">
					<h2 className="text-xs text-accent-600">TruncatedText</h2>
					<ul className="grid grid-cols-1 gap-1.5">
						{IDS.map((id) => (
							<li key={id}>
								<TruncatedText tail={6} value={id} />
							</li>
						))}
					</ul>
				</section>
			</main>
		</TooltipProvider>
	);
}
