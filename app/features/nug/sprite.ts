import { bayer } from "~/features/dither/dither.ts";

/** The sprite's width and height, in cells. */
export const NUG_SIZE = 60;

/** Where his thumb tip is, in cells: a pet floats a heart up from here. */
export const NUG_THUMB = { x: 47, y: 25 } as const;

/** The colors of the sprite. The shrimp tones are the 3D shrimp's palette. */
export const NUG_PALETTE = {
	outline: "#2b1218",
	shell: "#b8616d",
	shellLight: "#ffb1aa",
	shine: "#fff1e4",
	cheek: "#e8858f",
	hoodie: "#2a4aa8",
	hoodieLight: "#5b86e6",
	cap: "#c9d6dc",
	capLight: "#fff8f1",
	eye: "#120a0c",
} as const;

/** One color of the sprite, or `null` for no paint. */
export type NugColor = keyof typeof NUG_PALETTE;

/** A filled shape: a test for each cell, and the dark and light colors that its tone dithers between. */
type Region = {
	contains: (x: number, y: number) => boolean;
	dark: NugColor;
	light: NugColor;
	/** The light source of the region's shading, so a round part reads as round. */
	center: { x: number; y: number; radius: number };
	/** A tone above this paints the shine color, for the glossy top of the shell. */
	shine?: number;
};

/** An ellipse: its center, then its x and y radii, in cells. */
function ellipse([cx, cy, rx, ry]: [number, number, number, number]) {
	return (x: number, y: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
}

/** A rounded rectangle: its left, top, right, and bottom edges, then its corner radius, in cells. */
function roundedRect([left, top, right, bottom, radius]: [number, number, number, number, number]) {
	return (x: number, y: number) => {
		const dx = Math.max(left + radius - x, 0, x - (right - radius));
		const dy = Math.max(top + radius - y, 0, y - (bottom - radius));
		return (
			x >= left && x <= right && y >= top && y <= bottom && dx * dx + dy * dy <= radius * radius
		);
	};
}

/** The shading of a shell part: lit from `[x, y]` within `radius` cells, with an optional shine. */
function shell([x, y, radius]: [number, number, number], shine?: number): Omit<Region, "contains"> {
	return {
		dark: "shell",
		light: "shellLight",
		center: { x, y, radius },
		...(shine != null && { shine }),
	};
}

/** The filled parts, back to front. */
const REGIONS: Region[] = [
	// The tail curls out behind him, at the bottom right.
	{ contains: ellipse([40, 52, 4.5, 4]), ...shell([40, 52, 5]) },
	{ contains: ellipse([46, 51, 4, 3.6]), ...shell([46, 51, 4.5]) },
	{ contains: ellipse([51, 47.5, 3.6, 3.4]), ...shell([51, 47, 4]) },
	{ contains: ellipse([54.5, 42.5, 3.2, 4.2]), ...shell([54, 42, 4]) },
	// Little legs under the hoodie.
	{ contains: roundedRect([22, 53, 26, 57, 2]), ...shell([24, 54, 3]) },
	{ contains: roundedRect([31, 53, 35, 57, 2]), ...shell([33, 54, 3]) },
	// The hoodie, its hood at the neck, and the far sleeve with its little hand.
	{
		contains: roundedRect([16, 35, 42, 55, 7]),
		dark: "hoodie",
		light: "hoodieLight",
		center: { x: 24, y: 38, radius: 20 },
	},
	{
		contains: ellipse([29, 36, 12, 4]),
		dark: "hoodie",
		light: "hoodieLight",
		center: { x: 26, y: 34, radius: 12 },
	},
	{
		contains: ellipse([15, 44, 3.5, 5]),
		dark: "hoodie",
		light: "hoodieLight",
		center: { x: 14, y: 41, radius: 6 },
	},
	{ contains: ellipse([14, 49.5, 2.6, 2.4]), ...shell([14, 49, 3]) },
	// The near sleeve reaches up to the thumbs-up.
	{
		contains: ellipse([43.5, 38, 4, 5.5]),
		dark: "hoodie",
		light: "hoodieLight",
		center: { x: 42, y: 35, radius: 7 },
	},
	{ contains: ellipse([46.5, 31.5, 3.4, 3.2]), ...shell([45, 30, 4]) },
	{ contains: roundedRect([46, 24.5, 48.5, 31, 1.2]), ...shell([46, 25, 4]) },
	// The head, round and glossy.
	{ contains: ellipse([29, 22, 14, 13]), ...shell([23, 15, 22], 0.97) },
	// The sailor cap, with its band.
	{
		contains: ellipse([29, 9.5, 9.5, 4.5]),
		dark: "cap",
		light: "capLight",
		center: { x: 26, y: 6, radius: 10 },
	},
	{
		contains: roundedRect([19.5, 11, 38.5, 13, 0.5]),
		dark: "hoodie",
		light: "hoodieLight",
		center: { x: 24, y: 11, radius: 12 },
	},
];

/**
 * "ngrok" in a 3×7 pixel font. The letters sit on row 5; the k rises above
 * them, and the g drops below, so it does not read as a 9.
 */
const LETTERS: Record<string, readonly string[]> = {
	n: ["...", "...", "##.", "#.#", "#.#", "#.#", "..."],
	g: ["...", "...", ".##", "#.#", ".##", "..#", "##."],
	r: ["...", "...", "#.#", "##.", "#..", "#..", "..."],
	o: ["...", "...", ".#.", "#.#", "#.#", ".#.", "..."],
	k: ["#..", "#..", "#.#", "##.", "#.#", "#.#", "..."],
};

/** The cells of an open eye around its center: a tall oval, 3 cells wide and 5 tall. */
const OPEN_EYE = [
	[0, -2],
	[-1, -1],
	[0, -1],
	[1, -1],
	[-1, 0],
	[0, 0],
	[1, 0],
	[-1, 1],
	[0, 1],
	[1, 1],
	[0, 2],
] as const;

/** The eyes: open, with a shine, or shut in a happy `^ ^`. */
function eyeCells(happy: boolean): [number, number, NugColor][] {
	const cells: [number, number, NugColor][] = [];
	for (const cx of [24, 34]) {
		if (happy) {
			for (const [dx, dy] of [
				[-2, 1],
				[-1, 0],
				[0, -1],
				[1, 0],
				[2, 1],
			] as const) {
				cells.push([cx + dx, 23 + dy, "eye"]);
			}
		} else {
			for (const [dx, dy] of OPEN_EYE) {
				cells.push([cx + dx, 23 + dy, "eye"]);
			}
			cells.push([cx, 22, "shine"]);
		}
	}
	return cells;
}

/** The cells along a quadratic curve, for a one-cell line such as an antenna. */
function curve(from: [number, number], control: [number, number], to: [number, number]) {
	const cells = new Map<string, [number, number]>();
	for (let step = 0; step <= 40; step++) {
		const t = step / 40;
		const x = Math.round((1 - t) ** 2 * from[0] + 2 * (1 - t) * t * control[0] + t * t * to[0]);
		const y = Math.round((1 - t) ** 2 * from[1] + 2 * (1 - t) * t * control[1] + t * t * to[1]);
		cells.set(`${x},${y}`, [x, y]);
	}
	return [...cells.values()];
}

/** A grid of palette colors, `NUG_SIZE` cells on each side. `null` is no paint. */
type Grid = (NugColor | null)[][];

/** Paints each region, back to front, in its dithered tones. */
function paintRegions(grid: Grid) {
	for (const region of REGIONS) {
		for (const [y, row] of grid.entries()) {
			for (let x = 0; x < NUG_SIZE; x++) {
				if (!region.contains(x + 0.5, y + 0.5)) {
					continue;
				}
				const { center } = region;
				// Why this tone: light falls from the top left, so a cell nearer that edge of the part is lighter.
				const tone = Math.min(
					1,
					Math.max(0, 1 - Math.hypot(x - center.x, y - center.y) / (center.radius * 1.6)),
				);
				const lit = tone > bayer(x, y) ? region.light : region.dark;
				row[x] = region.shine != null && tone > region.shine ? "shine" : lit;
			}
		}
	}
}

/** Paints the outline: each empty cell that touches a painted one. */
function paintOutline(grid: Grid) {
	const painted = grid.map((row) => row.map((cell) => cell != null));
	for (const [y, row] of grid.entries()) {
		for (let x = 0; x < NUG_SIZE; x++) {
			const near = [
				painted[y - 1]?.[x],
				painted[y + 1]?.[x],
				painted[y]?.[x - 1],
				painted[y]?.[x + 1],
			];
			if (painted[y]?.[x] !== true && near.includes(true)) {
				row[x] = "outline";
			}
		}
	}
}

/** Paints one color into each cell of a list that falls on the grid. */
function paint(grid: Grid, cells: readonly (readonly [number, number])[], color: NugColor) {
	for (const [x, y] of cells) {
		const row = grid[y];
		if (row != null && x >= 0 && x < NUG_SIZE) {
			row[x] = color;
		}
	}
}

/** The cells of "ngrok" across his chest. */
function letterCells() {
	const cells: [number, number][] = [];
	for (const [index, letter] of ["n", "g", "r", "o", "k"].entries()) {
		for (const [row, line] of (LETTERS[letter] ?? []).entries()) {
			for (let column = 0; column < line.length; column++) {
				if (line.charAt(column) === "#") {
					cells.push([20 + index * 4 + column, 41 + row]);
				}
			}
		}
	}
	return cells;
}

/**
 * Draws Nug, the 2D shrimp in an ngrok hoodie, as a grid of palette colors.
 * Each part dithers between a dark and a light tone in the 4×4 Bayer pattern,
 * lit from the top left, like the 3D shrimp. An outline of one cell rings the
 * whole shape.
 *
 * @param happy Shuts his eyes in a happy `^ ^`, as after a pet.
 * @returns `NUG_SIZE` rows of `NUG_SIZE` cells; `null` is no paint.
 *
 * @example
 * nugSprite({ happy: false })[23]?.[24]; // => "eye"
 */
export function nugSprite({ happy }: { happy: boolean }): Grid {
	const grid: Grid = Array.from({ length: NUG_SIZE }, () =>
		Array.from({ length: NUG_SIZE }, () => null),
	);
	paintRegions(grid);
	paintOutline(grid);
	// The antennae sweep up and out from under the cap.
	paint(grid, curve([23, 7], [17, 1], [9, 2]), "shell");
	paint(grid, curve([35, 7], [41, 1], [49, 3]), "shell");
	paint(grid, letterCells(), "capLight");
	paint(
		grid,
		[
			[21, 27],
			[22, 27],
			[36, 27],
			[37, 27],
		],
		"cheek",
	);
	paint(
		grid,
		[
			[27, 29],
			[28, 30],
			[29, 30],
			[30, 30],
			[31, 29],
		],
		"outline",
	);
	for (const [x, y, color] of eyeCells(happy)) {
		paint(grid, [[x, y]], color);
	}
	return grid;
}
