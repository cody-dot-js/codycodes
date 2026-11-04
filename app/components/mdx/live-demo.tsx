/**
 * A live demo page in a frame that the reader can resize. Drag the corner to
 * change the frame's width, so the demo's own layout responds to it. The
 * caption links to the demo, for a reader whose device cannot drag the corner.
 *
 * @example
 * <LiveDemo src="/posts/keep-the-tail/demo" title="TruncatedText beside CSS truncate" height={220} />
 */
export function LiveDemo({ src, title, height }: { src: string; title: string; height: number }) {
	return (
		<figure className="grid gap-2">
			{/* Why narrow at first: the reader widens the box to see the demo change. Why padding: the resize handle sits in the box's corner, and the frame must not cover it. */}
			<div className="w-88 max-w-full min-w-64 resize-x overflow-hidden rounded-xl border border-rule bg-panel p-1.5 pb-4">
				{/* oxlint-disable-next-line react/iframe-missing-sandbox -- the demo is a page on this site, and a sandbox that lets it load its own modules from this origin also lets it lift the sandbox */}
				<iframe
					src={src}
					title={title}
					loading="lazy"
					height={height}
					className="block w-full rounded-lg"
				/>
			</div>
			<figcaption className="font-mono text-xs text-label">
				Live demo. Drag the bottom-right corner to resize it, or{" "}
				<a href={src} className="text-blush underline">
					open it in its own tab
				</a>
				.
			</figcaption>
		</figure>
	);
}
