// The ordered-dither ocean of the shrimpposting cards (`templates/waves.js`, rule I7), as a pure
// frame function. The site and the X cards share one look.

const TAU = Math.PI * 2;

/** CSS px between dots, the same pitch as the cards. */
export const CELL = 7;

/** The dot radius in CSS px. */
export const DOT_RADIUS = 1.8;

/** Seconds for one loop. Every swell turns a whole number of times, so the loop has no seam. */
export const LOOP_SECONDS = 24;

/** Doubles a Bayer matrix: each cell becomes a 2×2 block in the order 0, 2, 3, 1. */
function growBayer(matrix: number[][]): number[][] {
	const size = matrix.length;
	return Array.from({ length: size * 2 }, (_, y) =>
		Array.from({ length: size * 2 }, (__, x) => {
			const quadrant = [0, 2, 3, 1][(y >= size ? 2 : 0) + (x >= size ? 1 : 0)] ?? 0;
			return 4 * (matrix[y % size]?.[x % size] ?? 0) + quadrant;
		}),
	);
}

/** The 8×8 Bayer matrix, normalized to (0, 1). */
const BAYER = growBayer(growBayer(growBayer([[0]]))).map((row) =>
	row.map((value) => (value + 0.5) / 64),
);

type Swell = {
	/** The rest height of the surface, as a fraction of the band height. */
	base: number;
	amplitude: number;
	/** Waves across the band. */
	waves: number;
	/** Turns per loop. */
	turns: number;
	waves2: number;
	turns2: number;
	amplitude2: number;
	/** The darkness under the crest. */
	body: number;
	decay: number;
	rgb: readonly [number, number, number];
};

// Three swells, far to near: label blue, then two blushes.
const SWELLS: readonly Swell[] = [
	{
		base: 0.6,
		amplitude: 0.016,
		waves: 2.8,
		turns: 1,
		waves2: 5.4,
		turns2: 1,
		amplitude2: 0.005,
		body: 0.34,
		decay: 0.06,
		rgb: [169, 200, 209],
	},
	{
		base: 0.73,
		amplitude: 0.024,
		waves: 2.2,
		turns: 1,
		waves2: 4.2,
		turns2: -1,
		amplitude2: 0.007,
		body: 0.44,
		decay: 0.08,
		rgb: [233, 166, 162],
	},
	{
		base: 0.86,
		amplitude: 0.032,
		waves: 1.7,
		turns: 1,
		waves2: 3.3,
		turns2: 1,
		amplitude2: 0.009,
		body: 0.56,
		decay: 0.1,
		rgb: [255, 177, 170],
	},
];
const FOAM = [242, 226, 214] as const;

function smoothstep({ from, to, value }: { from: number; to: number; value: number }) {
	const clamped = Math.min(1, Math.max(0, (value - from) / (to - from)));
	return clamped * clamped * (3 - 2 * clamped);
}

function surface({ swell, across, phase }: { swell: Swell; across: number; phase: number }) {
	return (
		swell.base +
		swell.amplitude * Math.sin(TAU * (swell.waves * across - swell.turns * phase)) +
		swell.amplitude2 * Math.sin(TAU * (swell.waves2 * across - swell.turns2 * phase) + 1.7)
	);
}

/**
 * Computes one frame of the ocean: the center of each lit dot, grouped by its
 * fill color. The water fills the lower part of the band and fades in from
 * its far edge, so text above the band keeps its contrast.
 *
 * @param phase The place in the loop, from 0 to 1. Phase 0 and phase 1 give the same frame.
 *
 * @example
 * oceanFrame({ width: 800, height: 240, phase: 0 });
 * // => Map { "rgba(255,177,170,0.45)" => [x0, y0, x1, y1, …], … }
 */
export function oceanFrame({
	width,
	height,
	phase,
}: {
	width: number;
	height: number;
	phase: number;
}) {
	const dots = new Map<string, number[]>();
	const columns = Math.ceil(width / CELL);
	const rows = Math.ceil(height / CELL);
	for (let column = 0; column < columns; column++) {
		const across = column / columns;
		const tops = SWELLS.map((swell) => surface({ swell, across, phase }));
		for (let row = 0; row < rows; row++) {
			const down = row / rows;
			// The nearest swell that covers this point paints it, so near water hides far water.
			const index = SWELLS.findLastIndex(
				(_, swellIndex) => down - (tops[swellIndex] ?? 1) >= -0.012,
			);
			const swell = SWELLS[index];
			if (swell == null) {
				continue;
			}
			const depth = down - (tops[index] ?? 1);
			const crest = Math.exp(-((depth / 0.016) ** 2));
			const level =
				Math.max(
					swell.body * Math.exp(-Math.max(depth, 0) / swell.decay) * 0.9,
					crest * (0.5 + 0.08 * index),
				) * smoothstep({ from: 0.55, to: 0.92, value: down });
			if (level <= (BAYER[row % 8]?.[column % 8] ?? 1)) {
				continue;
			}
			const [red, green, blue] = crest > 0.45 ? FOAM : swell.rgb;
			// Why round the alpha: each color is one path, so fewer colors mean fewer fill calls.
			const alpha = Math.round((0.2 + 0.45 * level) * 20) / 20;
			const color = `rgba(${red},${green},${blue},${alpha})`;
			const list = dots.get(color) ?? [];
			list.push(column * CELL + CELL / 2, row * CELL + CELL / 2);
			dots.set(color, list);
		}
	}
	return dots;
}
