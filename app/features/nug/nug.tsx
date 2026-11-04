import { useCallback, useEffect, useRef } from "react";

import { BAYER_4, HEART } from "~/features/dither/dither.ts";

import { NUG_PALETTE, NUG_SIZE, NUG_THUMB, nugSprite } from "./sprite.ts";

/** How long one heart floats, and how long his eyes stay shut after a pet, in milliseconds. */
const PET_MS = 1400;
/** How far a heart rises from his thumb, in cells. */
const HEART_RISE = 16;

/** The two faces, drawn once each. */
const SPRITES = { calm: nugSprite({ happy: false }), happy: nugSprite({ happy: true }) };

/**
 * Draws one frame: his face, calm or happy while a pet is fresh, and a heart
 * for each pet, risen and dithered by its age.
 */
function drawNug(context: CanvasRenderingContext2D, pets: number[], now: number) {
	const sprite = pets.length > 0 ? SPRITES.happy : SPRITES.calm;
	context.clearRect(0, 0, NUG_SIZE, NUG_SIZE);
	for (const [y, row] of sprite.entries()) {
		for (const [x, color] of row.entries()) {
			if (color != null) {
				context.fillStyle = NUG_PALETTE[color];
				context.fillRect(x, y, 1, 1);
			}
		}
	}
	context.fillStyle = NUG_PALETTE.shellLight;
	for (const start of pets) {
		const progress = (now - start) / PET_MS;
		const top = Math.round(NUG_THUMB.y - 7 - progress * HEART_RISE);
		const left = Math.round(NUG_THUMB.x - 3 + Math.sin(progress * Math.PI * 2) * 1.5);
		// Why Bayer order: the heart dithers away like the 3D shrimp's hearts, not with a plain fade.
		for (const [row, cells] of HEART.entries()) {
			for (let column = 0; column < cells.length; column++) {
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
 * Nug: the 2D shrimp in an ngrok hoodie, in the same Bayer dither and shell
 * colors as the 3D shrimp. A pet (a click, or Enter on the focused button)
 * shuts his eyes in a happy `^ ^` and floats a pixel heart up from his thumb,
 * which dithers away as it rises. The canvas holds one pixel for each cell,
 * and CSS scales it up with sharp edges.
 *
 * @example
 * <Nug className="size-32" />
 */
export function Nug({ className }: { className: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pets = useRef<number[]>([]);
	const play = useRef<(() => void) | null>(null);

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
				drawNug(context, pets.current, now);
			}
			running = pets.current.length > 0;
			if (running) {
				frame = requestAnimationFrame(tick);
			}
		}
		tick(performance.now());
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
			className={`nug block rounded-xl ${className}`}
		>
			<canvas
				ref={canvasRef}
				width={NUG_SIZE}
				height={NUG_SIZE}
				aria-hidden="true"
				className="size-full [image-rendering:pixelated]"
			/>
		</button>
	);
}
