import { useCallback } from "react";

/**
 * A footnote mark: a small pink `?` that jumps to a note on the page. The note
 * takes a pink ring, and its `em` words a pink underline, while the URL points
 * at it (`:target`), so the jump works with no script. A second tap replays the
 * animation, because the URL does not change.
 *
 * @example
 * here to help you shrimp<NoteRef to="shrimp-note" label="What does shrimp mean?" />
 */
export function NoteRef({ to, label }: { to: string; label: string }) {
	const replay = useCallback(() => {
		if (location.hash !== `#${to}`) {
			return;
		}
		for (const animation of document
			.querySelector(`#${CSS.escape(to)}`)
			?.getAnimations({ subtree: true }) ?? []) {
			animation.cancel();
			animation.play();
		}
	}, [to]);
	return (
		<a href={`#${to}`} aria-label={label} title={label} onClick={replay} className="note-ref">
			?
		</a>
	);
}
