/**
 * A live demo page in a frame that the reader can resize. Drag the corner to
 * change the frame's width, so the demo's own layout responds to it. The
 * caption links to the demo, for a reader whose device cannot drag the corner.
 *
 * @example
 * <LiveDemo src="/posts/keep-the-tail/demo" title="TruncatedText beside CSS truncate" height={220} />
 * <LiveDemo src="/posts/keep-the-tail/demo-values" title="…" height={400} start="wide" />
 */
export function LiveDemo({
	src,
	title,
	height,
	start = "narrow",
}: {
	src: string;
	title: string;
	height: number;
	/** The frame's width before the reader drags it: 22rem, so the reader widens it, or the whole column, so the reader narrows it. Default `narrow`. */
	start?: "narrow" | "wide";
}) {
	return (
		<figure className="grid grid-cols-1 justify-items-center gap-2">
			{/* Why padding: the resize handle sits in the box's corner, and the frame must not cover it. */}
			<div
				className={`${start === "wide" ? "w-full" : "w-88"} max-w-full min-w-64 resize-x overflow-hidden rounded-xl border border-rule bg-panel p-1.5 pb-4`}
			>
				{/* oxlint-disable-next-line react/iframe-missing-sandbox -- the demo is a page on this site, and a sandbox that lets it load its own modules from this origin also lets it lift the sandbox */}
				<iframe
					src={src}
					title={title}
					loading="lazy"
					height={height}
					className="block w-full rounded-lg"
				/>
			</div>
			<figcaption className="text-center font-mono text-xs text-label">
				Live demo. Drag the bottom-right corner to resize it, or{" "}
				<a href={src} className="text-blush underline">
					open it in its own tab
				</a>
				.
			</figcaption>
		</figure>
	);
}
