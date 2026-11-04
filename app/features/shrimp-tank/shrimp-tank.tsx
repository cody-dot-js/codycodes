import { useEffect, useRef, useState } from "react";

import { lineAfter } from "./lines.ts";
import { SpeechBubble } from "./speech-bubble.tsx";
import { SpeechTail } from "./speech-tail.tsx";

/** Loads three.js and the scene in their own chunk. */
async function loadScene() {
	return import("./scene.ts");
}

/** The tank's state: three.js loads, then the scene runs or the browser has no WebGL. */
type TankStatus = "loading" | "ready" | "no-webgl";

/**
 * The shrimp. A pet (a click on him, or Enter or Space on the focused tank)
 * makes him squint, float hearts, swim a happy lap, and say a new line. He
 * swims toward a near cursor. three.js loads in its own chunk after the first
 * paint, and the tank keeps its size the whole time, so the load moves nothing.
 *
 * The tank takes no pointer events: the scene hit-tests clicks on the window,
 * so the shrimp can sit behind page text without blocking its links.
 * `className` places and sizes the tank; it must make a positioned box.
 *
 * @example
 * <ShrimpTank className="relative h-60 w-96" />
 */
export function ShrimpTank({ says, className }: { says?: string; className: string }) {
	const tankRef = useRef<HTMLButtonElement>(null);
	const bubblesRef = useRef<HTMLCanvasElement>(null);
	const speechRef = useRef<HTMLParagraphElement>(null);
	const [status, setStatus] = useState<TankStatus>("loading");
	const [pets, setPets] = useState(0);

	useEffect(() => {
		const tank = tankRef.current;
		const bubbles = bubblesRef.current;
		const speech = speechRef.current;
		if (tank == null || bubbles == null || speech == null) {
			return;
		}
		let dispose: (() => void) | undefined;
		let unmounted = false;
		async function mount(target: {
			tank: HTMLButtonElement;
			bubbles: HTMLCanvasElement;
			speech: HTMLParagraphElement;
		}) {
			let sceneModule: Awaited<ReturnType<typeof loadScene>>;
			try {
				sceneModule = await loadScene();
			} catch {
				// Why recover: the shrimp is decoration. A chunk that fails to load leaves the text fallback.
				setStatus("no-webgl");
				return;
			}
			if (unmounted) {
				return;
			}
			const scene = sceneModule.mountShrimpTank({ ...target, onPet: setPets });
			dispose = scene?.dispose;
			setStatus(scene == null ? "no-webgl" : "ready");
		}
		void mount({ tank, bubbles, speech });
		return () => {
			unmounted = true;
			dispose?.();
		};
	}, []);

	const line = pets === 0 && says != null ? says : lineAfter(pets);
	return (
		<div className={className}>
			<button
				ref={tankRef}
				type="button"
				aria-label="Pet the shrimp"
				className="pointer-events-none absolute inset-0 block rounded-xl"
			>
				<span
					aria-hidden="true"
					className="shrimp-dither absolute inset-[8%] rounded-full opacity-60"
				/>
				<canvas ref={bubblesRef} aria-hidden="true" className="absolute inset-0 z-10 size-full" />
				{status === "no-webgl" && (
					<span className="absolute inset-0 grid place-items-center font-mono text-xs text-label">
						the shrimp needs WebGL
					</span>
				)}
			</button>
			{/* Why a zero-size anchor: the scene moves it to the top of his head on each frame, and sets
			    `data-side` to the side he faces. The bubble and its tail swing to that side. */}
			<p
				ref={speechRef}
				aria-live="polite"
				data-side="right"
				className="group/speech pointer-events-none absolute top-0 left-0 z-20 size-0 will-change-transform"
			>
				{status === "ready" && (
					<>
						<SpeechTail className="absolute bottom-0 left-0 origin-bottom-left transition-transform duration-500 ease-out group-data-[side=left]/speech:-scale-x-100" />
						<span className="absolute bottom-10 left-4 w-max transition-transform duration-500 ease-out group-data-[side=left]/speech:-translate-x-[calc(100%+2rem)]">
							<SpeechBubble>{line}</SpeechBubble>
						</span>
					</>
				)}
			</p>
		</div>
	);
}
