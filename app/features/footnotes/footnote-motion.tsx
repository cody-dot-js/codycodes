import { useEffect } from "react";

/** How many small bubbles drift up from a footnote mark when a reader comes back to it. */
const BUBBLES = 5;
/** How long the pop and the bubbles last, in milliseconds. The CSS animations end inside it. */
const BUBBLE_MS = 1800;
/** How long to wait for the smooth scroll before the pop, when the browser has no `scrollend` event. */
const SCROLL_FALLBACK_MS = 450;

/**
 * Pops a bubble around a footnote mark, then lets small dotted bubbles drift up
 * from it, like the 3D shrimp's. The spans live inside the mark, so they move
 * with it while the page scrolls.
 */
function bubbleUp(mark: HTMLElement) {
	const spans = [document.createElement("span")];
	spans[0]?.classList.add("footnote-pop");
	for (let index = 0; index < BUBBLES; index++) {
		const bubble = document.createElement("span");
		bubble.className = "footnote-bubble";
		bubble.style.setProperty("--drift", `${(Math.random() - 0.5) * 18}px`);
		bubble.style.setProperty("--size", `${4 + Math.random() * 5}px`);
		bubble.style.setProperty("--delay", `${120 + index * 110}ms`);
		spans.push(bubble);
	}
	for (const span of spans) {
		span.setAttribute("aria-hidden", "true");
		mark.append(span);
	}
	setTimeout(() => {
		for (const span of spans) {
			span.remove();
		}
	}, BUBBLE_MS);
}

/** Restarts the CSS animations of an element and its children, for a second tap on the same link. */
function replay(element: Element | null) {
	for (const animation of element?.getAnimations({ subtree: true }) ?? []) {
		animation.cancel();
		animation.play();
	}
}

/** The element that a hash names, such as `#user-content-fn-1`. */
function hashTarget(hash: string) {
	return hash.length > 1
		? document.querySelector(`#${CSS.escape(decodeURIComponent(hash.slice(1)))}`)
		: null;
}

/** Runs `then` once the page stops scrolling. */
function afterScroll(then: () => void) {
	if ("onscrollend" in globalThis) {
		addEventListener("scrollend", then, { once: true });
		// Why a timer as well: a jump to an element already in view does not scroll, so no `scrollend` comes.
		setTimeout(() => {
			removeEventListener("scrollend", then);
			then();
		}, SCROLL_FALLBACK_MS);
		return;
	}
	setTimeout(then, SCROLL_FALLBACK_MS);
}

/**
 * The motion of footnotes on a page. A jump to a note rings it (in CSS, from
 * `:target`). A jump back to a footnote mark pops a bubble around it, and
 * small bubbles drift up. A second tap on the same link replays the motion,
 * because the URL does not change. With reduced motion, only the CSS rings
 * and underlines show. It renders nothing.
 *
 * @example
 * <FootnoteMotion />
 */
export function FootnoteMotion() {
	useEffect(() => {
		const calm = matchMedia("(prefers-reduced-motion: reduce)");
		let popped = false;
		function arrive() {
			const target = hashTarget(location.hash);
			if (target instanceof HTMLElement && target.matches("[data-footnote-ref]") && !calm.matches) {
				popped = false;
				afterScroll(() => {
					if (!popped) {
						popped = true;
						bubbleUp(target);
					}
				});
			}
		}
		function tap(event: MouseEvent) {
			const link =
				event.target instanceof Element
					? event.target.closest("a[data-footnote-ref], a[data-footnote-backref]")
					: null;
			if (link?.getAttribute("href") === location.hash) {
				replay(hashTarget(location.hash));
				arrive();
			}
		}
		addEventListener("hashchange", arrive);
		document.addEventListener("click", tap);
		return () => {
			removeEventListener("hashchange", arrive);
			document.removeEventListener("click", tap);
		};
	}, []);
	return null;
}
