import { useEffect, useRef } from "react";

/** Loads the swim in its own chunk, after the first paint. */
async function loadSwim() {
	return import("./swim.ts");
}

/**
 * The header shrimp from the shrimpposting brand, at the top right of every
 * page: the body and its dither wisps, with the swimmerets paddling and the
 * wisps rippling, the same as the moving X cards. The two stills are in the
 * prerendered HTML; the swim swaps in canvases of the same size after the
 * first paint, so nothing moves. It is decoration, so it takes no pointer
 * events and screen readers skip it.
 *
 * @example
 * <HeaderShrimp className="absolute top-10 right-0 w-96" />
 */
export function HeaderShrimp({ className }: { className: string }) {
	const bodyRef = useRef<HTMLImageElement>(null);
	const wispsRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		const body = bodyRef.current;
		const wisps = wispsRef.current;
		if (body == null || wisps == null) {
			return;
		}
		const controller = new AbortController();
		async function start(images: { body: HTMLImageElement; wisps: HTMLImageElement }) {
			try {
				await Promise.all([images.body.decode(), images.wisps.decode()]);
				const swim = await loadSwim();
				if (!controller.signal.aborted) {
					const stop = swim.mountHeaderShrimp(images);
					controller.signal.addEventListener("abort", stop, { once: true });
				}
			} catch {
				// Why ignore a failure: the stills already show, so a failed decode or chunk loses only the motion.
			}
		}
		void start({ body, wisps });
		return () => {
			controller.abort();
		};
	}, []);

	return (
		<div
			aria-hidden="true"
			className={`header-shrimp pointer-events-none aspect-[960/400] ${className}`}
		>
			<img
				ref={wispsRef}
				src="/brand/shrimp-wisps.webp"
				alt=""
				width={960}
				height={400}
				decoding="async"
				fetchPriority="low"
				className="absolute inset-0 size-full"
			/>
			<img
				ref={bodyRef}
				src="/brand/shrimp-body.webp"
				alt=""
				width={960}
				height={400}
				decoding="async"
				fetchPriority="low"
				className="absolute inset-0 size-full"
			/>
		</div>
	);
}
