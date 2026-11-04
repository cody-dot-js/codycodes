import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { ShrimpTank } from "~/features/shrimp-tank/shrimp-tank.tsx";

/**
 * An aside that a reader can skip: extra context with a small shrimp beside
 * it. The shrimp loads only when the aside scrolls near, and a pet makes him
 * happy. The text is in the prerendered HTML; the shrimp is decoration.
 *
 * @example
 * <Btw>mantle is open source, MIT licensed.</Btw>
 */
export function Btw({ children }: { children: ReactNode }) {
	const shrimpRef = useRef<HTMLDivElement>(null);
	const [near, setNear] = useState(false);

	useEffect(() => {
		const box = shrimpRef.current;
		if (box == null) {
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting === true) {
					setNear(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "200px" },
		);
		observer.observe(box);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<aside className="btw grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border-2 border-dotted border-label/40 py-3 pr-4 pl-1 sm:grid-cols-[8rem_minmax(0,1fr)]">
			{/* Why a fixed box: the shrimp mounts later, and the aside must not move when he does. */}
			<div ref={shrimpRef} className="relative aspect-square">
				{near && <ShrimpTank says="psst." className="relative size-full" />}
			</div>
			<div className="grid gap-2 text-[0.95rem] text-label">
				<p className="font-mono text-xs tracking-wider text-blush uppercase">btw</p>
				{children}
			</div>
		</aside>
	);
}
