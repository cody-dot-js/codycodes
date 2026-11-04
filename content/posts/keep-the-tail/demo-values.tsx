import { TooltipProvider } from "@ngrok/mantle/tooltip";
import { TruncatedText } from "@ngrok/mantle/truncated-text";
import type { ReactNode } from "react";
import type { LinksFunction, MetaFunction } from "react-router";

import demoUrl from "./demo.css?url";

/** One kind of value: two samples that differ only near the end, and how TruncatedText keeps that end. */
type ValueCase = { label: string; values: [string, string]; clip: (value: string) => ReactNode };

// Why these samples: the first of each pair is a value from mantle's docs or the paths of TruncatedText's
// own files. The second changes only its end, so the pair shows what each clip keeps.
const CASES: ValueCase[] = [
	{
		label: "URL · tail={10}",
		clip: (value) => <TruncatedText tail={10} value={value} />,
		values: [
			"https://example.ngrok.app/api/items?filter=%7B%22name%22%3A%22x%22%7D&limit=200",
			"https://example.ngrok.app/api/items?filter=%7B%22name%22%3A%22x%22%7D&limit=500",
		],
	},
	{
		label: "Image · tail={12} · asChild <code>",
		clip: (value) => (
			<TruncatedText asChild tail={12} value={value}>
				<code />
			</TruncatedText>
		),
		values: [
			"ghcr.io/ngrok/ngrok-operator:0.14.0-rc.2",
			"ghcr.io/ngrok/ngrok-operator:0.14.0-rc.3",
		],
	},
	{
		label: "File path · tail={18}",
		clip: (value) => <TruncatedText tail={18} value={value} />,
		values: [
			"packages/mantle/src/components/truncated-text/truncated-text.tsx",
			"packages/mantle/src/components/truncated-text/split-tail.test.ts",
		],
	},
	{
		label: "ID with its type · head={4}",
		clip: (value) => <TruncatedText head={4} value={value} />,
		values: ["mem_21h80N9qQuAmhSB8nlTA8KImPbQ", "mem_21h80N9qQuAmhSB8nlTB2xYzRsT"],
	},
];

export const links: LinksFunction = () => [{ rel: "stylesheet", href: demoUrl }];

// Why noindex: the post embeds this page in a frame. On its own it is a fragment of the post.
export const meta: MetaFunction = () => [
	{ title: "TruncatedText values demo" },
	{ name: "robots", content: "noindex" },
];

export default function TruncatedTextValuesDemo() {
	return (
		<TooltipProvider>
			{/* Why invert-theme: mantle's dark tokens apply to this subtree. The site's dark ground shows through. */}
			<main className="invert-theme grid gap-3 p-3 font-mono text-sm text-body">
				{CASES.map((valueCase) => (
					<section key={valueCase.label} className="grid gap-1.5">
						<h2 className="text-xs text-muted">{valueCase.label}</h2>
						<div className="grid grid-cols-2 gap-3">
							<ul className="grid grid-cols-1 gap-1 rounded-lg border border-card px-3 py-2">
								{valueCase.values.map((value) => (
									<li key={value} className="truncate">
										{value}
									</li>
								))}
							</ul>
							<ul className="grid grid-cols-1 gap-1 rounded-lg border border-accent-600 px-3 py-2">
								{valueCase.values.map((value) => (
									<li key={value}>{valueCase.clip(value)}</li>
								))}
							</ul>
						</div>
					</section>
				))}
			</main>
		</TooltipProvider>
	);
}
