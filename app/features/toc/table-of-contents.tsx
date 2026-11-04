import { useEffect, useState } from "react";

import type { TocEntry } from "~/features/posts/rehype-post-handle.ts";

/** The distance from the top of the viewport at which a heading becomes the active one, in CSS pixels. */
const TRIGGER_OFFSET = 96;
/** The scroll progress after which the trigger line eases down to the bottom of the viewport. */
const EASE_START = 0.75;

function clamp01(value: number) {
	return Math.min(1, Math.max(0, value));
}

/**
 * The `id` of the heading that the reader is in. Near the end of the page the
 * trigger line eases down to the bottom of the viewport, so the last headings,
 * which cannot scroll to the top, still become active. A port of the scroll
 * spy in mantle's docs, after https://thirty-five.com/overengineered-anchoring.
 */
function useActiveHeading(entries: TocEntry[], media: string) {
	const [activeId, setActiveId] = useState(entries[0]?.id);

	useEffect(() => {
		const visible = matchMedia(media);
		let frame: number | undefined;

		function measure() {
			frame = undefined;
			const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
			const progress = clamp01(scrollTop / Math.max(1, scrollHeight - clientHeight));
			const ease = clamp01((progress - EASE_START) / (1 - EASE_START));
			const trigger = Math.round(
				scrollTop + TRIGGER_OFFSET + ease * ease * (3 - 2 * ease) * (clientHeight - TRIGGER_OFFSET),
			);
			const passed = entries.filter((entry) => {
				const top = document.querySelector(`#${CSS.escape(entry.id)}`)?.getBoundingClientRect().top;
				return top != null && Math.round(top + scrollTop) <= trigger;
			});
			setActiveId(passed.at(-1)?.id ?? entries[0]?.id);
		}

		function schedule() {
			// Why the media check: below the breakpoint the list is hidden, so it measures nothing.
			if (frame == null && visible.matches) {
				frame = requestAnimationFrame(measure);
			}
		}

		schedule();
		addEventListener("scroll", schedule, { passive: true });
		addEventListener("resize", schedule);
		return () => {
			if (frame != null) {
				cancelAnimationFrame(frame);
			}
			removeEventListener("scroll", schedule);
			removeEventListener("resize", schedule);
		};
	}, [entries, media]);

	return activeId;
}

/**
 * The post's headings as a list of links, with the reader's section marked.
 * The entries come from the post module at build time, so the prerendered
 * HTML has the whole list, and only the active mark waits for JavaScript.
 *
 * @example
 * <TableOfContents entries={toc} media="(min-width: 64rem)" />
 */
export function TableOfContents({ entries, media }: { entries: TocEntry[]; media: string }) {
	const activeId = useActiveHeading(entries, media);
	if (entries.length === 0) {
		return null;
	}
	return (
		<nav aria-label="On this page" className="sticky top-8 grid gap-3">
			<p className="font-mono text-xs tracking-wider text-label uppercase">on this page</p>
			<ol className="grid border-l border-rule text-sm">
				{entries.map((entry) => (
					<li key={entry.id}>
						<a
							href={`#${entry.id}`}
							aria-current={entry.id === activeId ? "location" : undefined}
							className={`-ml-px block border-l-2 py-1 leading-snug text-label hover:text-ink aria-[current=location]:border-blush aria-[current=location]:text-ink ${entry.level === 3 ? "pl-6" : "pl-3"} border-transparent`}
						>
							{entry.text}
						</a>
					</li>
				))}
			</ol>
		</nav>
	);
}
