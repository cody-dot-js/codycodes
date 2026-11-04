import { useCallback, useEffect, useRef, useState } from "react";

import { BAYER_4, HEART } from "~/features/dither/dither.ts";

import calmUrl from "./nug-calm.png";
import happyUrl from "./nug-happy.png";

/** How long one heart floats, and how long his eyes stay shut after a pet, in milliseconds. */
const PET_MS = 1400;
/** The heart canvas, in cells of 2 CSS px, the cell size of the 3D shrimp's hearts. */
const GRID = 88;
/** His thumb tip in that grid: each heart floats up from here. */
const THUMB = { x: 18, y: 38 } as const;
/** How far a heart rises, in cells. */
const HEART_RISE = 14;

/** Draws the heart of each fresh pet, risen and dithered away by its age. */
function drawHearts(context: CanvasRenderingContext2D, pets: number[], now: number) {
	context.clearRect(0, 0, GRID, GRID);
	context.fillStyle = "#ffb1aa";
	for (const start of pets) {
		const progress = (now - start) / PET_MS;
		const top = Math.round(THUMB.y - 7 - progress * HEART_RISE);
		const left = Math.round(THUMB.x - 3 + Math.sin(progress * Math.PI * 2) * 1.5);
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
 * the HTML, so the first pet shows at once.
 *
 * @example
 * <Nug className="size-44" />
 */
export function Nug({ className }: { className: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pets = useRef<number[]>([]);
	const play = useRef<(() => void) | null>(null);
	const [happy, setHappy] = useState(false);

	useEffect(() => {
		const context = canvasRef.current?.getContext("2d");
		if (context == null) {
			return;
		}
		let frame = 0;
		let running = false;
		// Why a loop only while a pet is fresh: a still Nug costs no frames.
		function tick(now: number) {
			pets.current = pets.current.filter((start) => now - start < PET_MS);
			if (context != null) {
				drawHearts(context, pets.current, now);
			}
			running = pets.current.length > 0;
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
		pets.current.push(performance.now());
		play.current?.();
	}, []);

	return (
		<button
			type="button"
			aria-label="Pet Nug"
			onClick={pet}
			className={`nug relative block ${className}`}
		>
			<img
				src={calmUrl}
				alt=""
				width={176}
				height={176}
				hidden={happy}
				className="size-full [image-rendering:pixelated]"
			/>
			<img
				src={happyUrl}
				alt=""
				width={176}
				height={176}
				hidden={!happy}
				className="size-full [image-rendering:pixelated]"
			/>
			<canvas
				ref={canvasRef}
				width={GRID}
				height={GRID}
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 size-full [image-rendering:pixelated]"
			/>
		</button>
	);
}
