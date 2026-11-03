import { useEffect, useRef, useState } from "react";

/** Loads three.js and the scene in their own chunk. */
async function loadScene() {
	return import("./scene.ts");
}

/** The tank's state: three.js loads, then the scene runs or the browser has no WebGL. */
type TankStatus = "loading" | "swimming" | "resting" | "no-webgl";

/**
 * The home page hero: a 3D shrimp in a tank. A click on the shrimp, or Enter
 * or Space on the focused tank, adds a lap. three.js loads in its own chunk
 * after the first paint, and the tank keeps its size the whole time, so the
 * load moves nothing on the page.
 *
 * @example
 * <ShrimpTank />
 */
export function ShrimpTank() {
	const tankRef = useRef<HTMLButtonElement>(null);
	const bubblesRef = useRef<HTMLCanvasElement>(null);
	const [status, setStatus] = useState<TankStatus>("loading");
	const [laps, setLaps] = useState(0);

	useEffect(() => {
		const tank = tankRef.current;
		const bubbles = bubblesRef.current;
		if (tank == null || bubbles == null) {
			return;
		}
		let dispose: (() => void) | undefined;
		let unmounted = false;
		async function mount(target: { tank: HTMLButtonElement; bubbles: HTMLCanvasElement }) {
			let sceneModule: Awaited<ReturnType<typeof loadScene>>;
			try {
				sceneModule = await loadScene();
			} catch {
				// Why recover: the hero is decoration. A chunk that fails to load leaves the text fallback.
				setStatus("no-webgl");
				return;
			}
			if (unmounted) {
				return;
			}
			const scene = sceneModule.mountShrimpTank({
				...target,
				onLap: (count) => {
					setLaps(count);
					setStatus("swimming");
				},
				onRest: () => {
					setStatus("resting");
				},
			});
			dispose = scene?.dispose;
			setStatus(scene == null ? "no-webgl" : "resting");
		}
		void mount({ tank, bubbles });
		return () => {
			unmounted = true;
			dispose?.();
		};
	}, []);

	return (
		<div className="grid gap-3">
			<button
				ref={tankRef}
				type="button"
				aria-label="Make the shrimp swim a lap"
				aria-describedby="shrimp-hint"
				className="relative block h-[clamp(320px,48vw,480px)] w-full cursor-default rounded-xl data-[over=true]:cursor-pointer"
			>
				<canvas
					ref={bubblesRef}
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 size-full"
				/>
				{status === "no-webgl" && (
					<span className="absolute inset-0 grid place-items-center font-mono text-sm text-label">
						the shrimp needs WebGL
					</span>
				)}
			</button>
			<p className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 border-t border-rule pt-3 font-mono text-sm text-label">
				<span id="shrimp-hint">
					{status === "swimming" ? "click again to add a lap, up to 3" : "click the shrimp"}
				</span>
				<span aria-live="polite">
					laps <b className="font-medium text-blush tabular-nums">{laps}</b>
				</span>
			</p>
		</div>
	);
}
