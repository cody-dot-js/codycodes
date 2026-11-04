import { useEffect, useRef, useState } from "react";

import { ShrimpTank } from "~/features/shrimp-tank/shrimp-tank.tsx";

/**
 * The shrimp, inline in a post, with a line to say. A pet makes him happy, the
 * same as the shrimp in the corner. His scene mounts only when he scrolls near,
 * so a post with a few of him opens only the WebGL contexts the reader sees.
 * The box keeps its size before and after, so the load moves nothing.
 *
 * @example
 * <ShrimpSays>the LCP was a 249 kB blur.</ShrimpSays>
 */
export function ShrimpSays({ children }: { children: string }) {
	const boxRef = useRef<HTMLDivElement>(null);
	const [near, setNear] = useState(false);

	useEffect(() => {
		const box = boxRef.current;
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
			// Why 200 px: three.js is cached after the first shrimp, so this is enough lead to mount before he shows.
			{ rootMargin: "200px" },
		);
		observer.observe(box);
		return () => {
			observer.disconnect();
		};
	}, []);

	return (
		<figure ref={boxRef} className="relative my-2 h-[180px] w-full max-w-[420px]">
			{/* Why a caption: the line is content, so it is in the prerendered HTML for readers and agents. */}
			<figcaption className="sr-only">The shrimp says: {children}</figcaption>
			{near && <ShrimpTank says={children} className="relative size-full" />}
		</figure>
	);
}
