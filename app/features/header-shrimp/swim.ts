// The header shrimp from the shrimpposting brand, swimming: a port of the moving cards'
// `templates/waves.js` (rule I7), so the site and the X cards share one animation. Every number is in
// the source pixels of the art (960 × 400, head to the left).

const TAU = Math.PI * 2;

/** Seconds per swim cycle, the same as the moving cards. */
const SWIM_SECONDS = 8;

/** Strokes per swim cycle: 0.75 Hz, slow on purpose. */
const BEATS = 6;

/** The art's swimmerets: source x spans, front to back. */
const LEGS = [
	[560, 614],
	[614, 674],
	[674, 718],
	[718, 762],
] as const;

/**
 * The art hides the first pair behind the walking legs. A shrimp has five, so the first pair is the
 * second leg's own pixels, smaller, hinged at the first abdominal segment.
 */
const FIRST = { from: 0, hx: 534, scale: 0.82 } as const;

/** Source y just below the lowest swimmeret tip. */
const BOTTOM = 300;

/** Radians. With the stroke curve below, the full sweep is about 57 degrees. */
const SWING = 0.42;

/** Why 18%: swimming studies of the grass shrimp measure that lag between neighbors, rear leg first (doi:10.1242/jeb.249330). */
const LAG = TAU * 0.18;

/** The abdomen's lower edge on the source art. A leg is everything below it in its span. */
const EDGE = [
	[520, 190],
	[556, 192],
	[614, 194],
	[674, 199],
	[718, 214],
	[762, 234],
] as const;

/** Where the whiskers leave the head; the sway grows toward x = 0. */
const WHISKERS = { x1: 205, amp: 10 } as const;

/** The walking legs under the carapace. */
const WALKERS = { x0: 255, x1: 545, y0: 175, y1: 365, amp: 5, trail: 4 } as const;

/** Source px per warped piece of a walking-leg row. */
const SEGMENT = 8;

/** The moving cards run at 30 frames a second. The art moves slowly, so the site does too. */
const FRAME_MS = 1000 / 30;

function smooth({ from, to, value }: { from: number; to: number; value: number }) {
	const clamped = Math.min(1, Math.max(0, (value - from) / (to - from)));
	return clamped * clamped * (3 - 2 * clamped);
}

function underside(x: number): number {
	for (let index = 1; index < EDGE.length; index++) {
		const [ax, ay] = EDGE[index - 1] ?? [0, 0];
		const [bx, by] = EDGE[index] ?? [0, 0];
		if (x <= bx) {
			return ay + ((by - ay) * (x - ax)) / (bx - ax);
		}
	}
	return EDGE.at(-1)?.[1] ?? 0;
}

/** One slow burst of strokes per swim cycle. */
function burst(phase: number) {
	return phase > 0.12 && phase < 0.62 ? Math.sin((Math.PI * (phase - 0.12)) / 0.5) ** 2 : 0;
}

/** Forward during the burst, then a slow drift back on the current. */
function glide(phase: number) {
	const shifted = (phase - 0.12 + 1) % 1;
	return shifted < 0.5
		? -16 * smooth({ from: 0, to: 0.5, value: shifted })
		: -16 * (1 - smooth({ from: 0.5, to: 1, value: shifted }));
}

type Leg = {
	sprite: HTMLCanvasElement;
	hx: number;
	hy: number;
	dx: number;
	dy: number;
	scale: number;
};

/** Each swimmeret as its own sprite, cut along the edge, so a swing never carries a piece of the body. */
function legSprites(body: HTMLImageElement): Leg[] {
	return LEGS.map(([x0, x1]) => {
		const top = Math.floor(Math.min(underside(x0), underside(x1)));
		const sprite = document.createElement("canvas");
		sprite.width = x1 - x0;
		sprite.height = BOTTOM - top;
		const context = sprite.getContext("2d");
		context?.drawImage(
			body,
			x0,
			top,
			sprite.width,
			sprite.height,
			0,
			0,
			sprite.width,
			sprite.height,
		);
		if (context != null) {
			context.fillStyle = "#000";
			for (let x = x0; x < x1; x++) {
				context.fillRect(x - x0, 0, 1, Math.ceil(underside(x)) - top);
			}
		}
		const hx = (x0 + x1) / 2;
		const hy = underside(hx);
		return { sprite, hx, hy, dx: x0 - hx, dy: top - hy, scale: 1 };
	});
}

type Layers = {
	body: HTMLImageElement;
	wisps: HTMLImageElement;
	water: HTMLCanvasElement;
	shrimp: HTMLCanvasElement;
};

/** The wisps ripple in place, and each stroke pushes the water behind the shrimp toward the tail. */
function drawWater({ wisps, water }: Layers, { phase, energy }: { phase: number; energy: number }) {
	const context = water.getContext("2d");
	if (context == null) {
		return;
	}
	context.imageSmoothingEnabled = false;
	context.clearRect(0, 0, water.width, water.height);
	for (let y = 0; y < water.height; y += 2) {
		const ripple =
			3 * Math.sin(TAU * (y / 70 - 2 * phase)) + 1.5 * Math.sin(TAU * (y / 27 + 3 * phase));
		const wake =
			5 *
			energy *
			Math.max(0, Math.sin(TAU * BEATS * phase)) *
			smooth({ from: 150, to: 230, value: y }) *
			smooth({ from: 380, to: 300, value: y });
		context.drawImage(wisps, 0, y, water.width, 2, ripple + wake, y, water.width, 2);
	}
}

/** Draws one frame of the animal and returns the stroke energy, which the water reads. */
function drawShrimp(
	{ body, shrimp }: Layers,
	{ phase, legs }: { phase: number; legs: Leg[] },
): number {
	const context = shrimp.getContext("2d");
	if (context == null) {
		return 0;
	}
	context.imageSmoothingEnabled = false;
	context.globalCompositeOperation = "source-over";
	context.clearRect(0, 0, shrimp.width, shrimp.height);
	context.drawImage(body, 0, 0);
	const energy = burst(phase);
	// Why black: the body layer's ground is black, and the screen blend shows black as nothing.
	context.fillStyle = "#000";
	// Whiskers: each 2 px column moves up or down, and the phase lags toward the tips, so they flex.
	for (let x = 0; x < WHISKERS.x1; x += 2) {
		const lever = ((WHISKERS.x1 - x) / WHISKERS.x1) ** 1.6;
		const dy = WHISKERS.amp * lever * Math.sin(TAU * phase - 0.012 * (WHISKERS.x1 - x));
		context.fillRect(x, 0, 2, shrimp.height);
		context.drawImage(body, x, 0, 2, shrimp.height, x, dy, 2, shrimp.height);
	}
	// Walking legs: each row moves sideways, more toward the feet, and trails back while the body glides.
	const { x0, x1, y0, y1 } = WALKERS;
	context.fillRect(x0, y0, x1 - x0, y1 - y0);
	for (let y = y0; y < y1; y += 2) {
		const lever = ((y - y0) / (y1 - y0)) ** 1.5;
		const sway = lever * (WALKERS.amp * Math.sin(TAU * phase + 1.2) + WALKERS.trail * energy);
		for (let x = x0; x < x1; x += SEGMENT) {
			const dx =
				sway *
				smooth({ from: x0, to: x0 + 55, value: x }) *
				smooth({ from: x1, to: x1 - 45, value: x });
			context.drawImage(body, x, y, SEGMENT, 2, x + dx, y, SEGMENT, 2);
		}
	}
	// Swimmerets: clear each band along the edge, then paint every leg with "lighten", so one leg's dark
	// ground never covers its neighbor.
	for (const [legX0, legX1] of LEGS) {
		for (let x = legX0; x < legX1; x++) {
			context.fillRect(x, Math.ceil(underside(x)), 1, BOTTOM - Math.ceil(underside(x)));
		}
	}
	const firstLeg = legs[FIRST.from];
	const all =
		firstLeg == null
			? legs
			: [{ ...firstLeg, hx: FIRST.hx, hy: underside(FIRST.hx), scale: FIRST.scale }, ...legs];
	context.globalCompositeOperation = "lighten";
	for (const [index, leg] of all.entries()) {
		// A power stroke toward the tail and a slower recovery: a sine with a second harmonic. On the
		// recovery stroke the leg folds and draws in, as real swimmerets do to cut drag.
		const legPhase = TAU * BEATS * phase + LAG * (all.length - 1 - index);
		const angle = -energy * SWING * (Math.sin(legPhase) + 0.35 * Math.sin(2 * legPhase));
		const fold = (energy * Math.max(0, -(Math.cos(legPhase) + 0.7 * Math.cos(2 * legPhase)))) / 1.7;
		context.save();
		context.translate(leg.hx, leg.hy);
		context.rotate(angle);
		context.scale(leg.scale * (1 - 0.1 * fold), leg.scale * (1 - 0.2 * fold));
		context.drawImage(leg.sprite, leg.dx, leg.dy);
		context.restore();
	}
	context.globalCompositeOperation = "source-over";
	shrimp.style.transform = `translate(${(glide(phase) + 4 * Math.sin(TAU * phase)) / 4}px, ${(8 * Math.sin(TAU * phase + 1)) / 4}px) rotate(${0.8 * Math.sin(TAU * phase) - 0.6 * energy}deg)`;
	return energy;
}

/** A canvas at the art's full size, styled like the image it replaces. */
function makeCanvas(image: HTMLImageElement) {
	const canvas = document.createElement("canvas");
	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;
	canvas.className = image.className;
	canvas.setAttribute("aria-hidden", "true");
	image.after(canvas);
	return canvas;
}

/**
 * Swaps the two still images for canvases and runs the swim. The loop runs at 30 frames a second, only
 * while the shrimp is on screen and the tab is visible. With reduced motion, the stills stay.
 *
 * @returns A function that stops the loop and puts the stills back.
 */
export function mountHeaderShrimp({
	body,
	wisps,
}: {
	body: HTMLImageElement;
	wisps: HTMLImageElement;
}): () => void {
	const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
	const layers: Layers = { body, wisps, water: makeCanvas(wisps), shrimp: makeCanvas(body) };
	const legs = legSprites(body);
	const state = { visible: false, frame: 0, last: 0, start: performance.now() };

	function show({ animated }: { animated: boolean }) {
		body.hidden = animated;
		wisps.hidden = animated;
		layers.water.hidden = !animated;
		layers.shrimp.hidden = !animated;
	}

	function tick(now: number) {
		state.frame = 0;
		if (!state.visible || document.hidden || reducedMotion.matches) {
			return;
		}
		if (now - state.last >= FRAME_MS) {
			state.last = now;
			const phase = ((((now - state.start) / 1000 / SWIM_SECONDS) % 1) + 1) % 1;
			const energy = drawShrimp(layers, { phase, legs });
			drawWater(layers, { phase, energy });
			show({ animated: true });
		}
		state.frame = requestAnimationFrame(tick);
	}

	function wake() {
		if (reducedMotion.matches) {
			show({ animated: false });
			return;
		}
		if (state.frame === 0) {
			state.frame = requestAnimationFrame(tick);
		}
	}

	show({ animated: false });
	const intersection = new IntersectionObserver(([entry]) => {
		state.visible = entry?.isIntersecting ?? false;
		wake();
	});
	// Why the parent: the images hide while the canvases show, and a hidden element never intersects.
	intersection.observe(body.parentElement ?? body);
	document.addEventListener("visibilitychange", wake);
	reducedMotion.addEventListener("change", wake);
	return () => {
		cancelAnimationFrame(state.frame);
		intersection.disconnect();
		document.removeEventListener("visibilitychange", wake);
		reducedMotion.removeEventListener("change", wake);
		layers.water.remove();
		layers.shrimp.remove();
		show({ animated: false });
	};
}
