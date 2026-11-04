import { useCallback, useEffect, useRef, useState } from "react";

import { BAYER_4, HEART } from "~/features/dither/dither.ts";

import calm176 from "./nug-calm-176.png";
import calm88 from "./nug-calm-88.png";
import happy176 from "./nug-happy-176.png";
import happy88 from "./nug-happy-88.png";

/** The frames for each size. Each is dithered at its own size, so the dots stay one pixel each. */
const FRAMES = {
	88: { calm: calm88, happy: happy88 },
	176: { calm: calm176, happy: happy176 },
} as const;

/** How long one heart floats, and how long his eyes stay shut after a pet, in milliseconds. */
const PET_MS = 1400;
/** His thumb tip, as a share of his width and height: each heart floats up from here. */
const THUMB = { x: 0.205, y: 0.43 } as const;
/** How far a heart rises, as a share of his height. */
const HEART_RISE = 0.16;
/** How many fresh pets start his nug walk. */
const NUG_WALK_PETS = 3;
/** The parts that move on their own in the nug walk. Each is a clipped copy of the happy frame. */
const LIMBS = ["arm", "left-foot", "right-foot"] as const;
/** How long one nug walk lasts, in milliseconds. `nug-walk` in `global.css` uses the same time. */
const NUG_WALK_MS = 2400;

/** Draws the heart of each fresh pet, risen and dithered away by its age. */
function drawHearts(context: CanvasRenderingContext2D, pets: number[], now: number) {
	const grid = context.canvas.width;
	context.clearRect(0, 0, grid, grid);
	context.fillStyle = "#ffb1aa";
	for (const start of pets) {
		const progress = (now - start) / PET_MS;
		const top = Math.round(THUMB.y * grid - 7 - progress * HEART_RISE * grid);
		const left = Math.round(THUMB.x * grid - 3 + Math.sin(progress * Math.PI * 2) * 1.5);
		for (const [row, cells] of HEART.entries()) {
			for (let column = 0; column < cells.length; column++) {
				// Why Bayer order: the heart dithers away like the 3D shrimp's hearts, not with a plain fade.
				if (
					cells.charAt(column) === "#" &&
					(BAYER_4[row % 4]?.[column % 4] ?? 0) / 16 < 1 - progress
				) {
					context.fillRect(left + column, top + row, 1, 1);
				}
			}
		}
	}
}

/**
 * Nug: the shrimp in the ngrok hoodie, dithered in the site's shell and abyss
 * colors. A pet (a click, or Enter on the focused button) shuts his eyes in a
 * happy `^ ^` and floats a pixel heart up from his thumb. Both faces are in
 * the HTML, so the first pet shows at once. The heart's cells are 2 CSS px, as
 * the 3D shrimp's are, so its canvas holds half his size. Three quick pets
 * start the nug walk, his plug walk: he struts from side to side, pumps his
 * thumb, and steps on each beat, in sprite steps.
 *
 * @example
 * <Nug size={176} className="justify-self-center" />
 */
export function Nug({ size, className }: { size: 88 | 176; className: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pets = useRef<number[]>([]);
	const play = useRef<(() => void) | null>(null);
	const walkStart = useRef(Number.NEGATIVE_INFINITY);
	const [happy, setHappy] = useState(false);
	const [walking, setWalking] = useState(false);

	useEffect(() => {
		const context = canvasRef.current?.getContext("2d");
		if (context == null) {
			return;
		}
		let frame = 0;
		let running = false;
		// Why a loop only while a pet is fresh or he struts: a still Nug costs no frames.
		function tick(now: number) {
			pets.current = pets.current.filter((start) => now - start < PET_MS);
			if (context != null) {
				drawHearts(context, pets.current, now);
			}
			const strutting = now - walkStart.current < NUG_WALK_MS;
			setWalking(strutting);
			running = pets.current.length > 0 || strutting;
			setHappy(running);
			if (running) {
				frame = requestAnimationFrame(tick);
			}
		}
		play.current = () => {
			if (!running) {
				running = true;
				frame = requestAnimationFrame(tick);
			}
		};
		return () => {
			cancelAnimationFrame(frame);
			play.current = null;
		};
	}, []);

	const pet = useCallback(() => {
		const now = performance.now();
		pets.current.push(now);
		// Why only the third: more pets during the walk do not start it again.
		if (pets.current.length === NUG_WALK_PETS) {
			walkStart.current = now;
			setWalking(true);
		}
		play.current?.();
	}, []);

	return (
		<button
			type="button"
			aria-label="Pet Nug"
			onClick={pet}
			data-nug-walk={walking || undefined}
			className={`nug relative block shrink-0 ${className}`}
		>
			<img
				src={FRAMES[size].calm}
				alt=""
				width={size}
				height={size}
				hidden={happy}
				className="block [image-rendering:pixelated]"
			/>
			<img
				src={FRAMES[size].happy}
				alt=""
				width={size}
				height={size}
				hidden={!happy}
				className="block [image-rendering:pixelated]"
			/>
			{walking &&
				LIMBS.map((limb) => (
					<img
						key={limb}
						src={FRAMES[size].happy}
						alt=""
						width={size}
						height={size}
						data-limb={limb}
						className="absolute inset-0 block [image-rendering:pixelated]"
					/>
				))}
			<canvas
				ref={canvasRef}
				width={size / 2}
				height={size / 2}
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]"
			/>
		</button>
	);
}
