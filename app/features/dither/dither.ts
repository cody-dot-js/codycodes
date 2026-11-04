/** The pixel heart that a pet floats, as rows of cells. Why 7×6: it reads as a heart at 2 px cells. */
export const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."] as const;

/** A 4×4 Bayer matrix: the ordered dither of the brand, for shading and for fades. */
export const BAYER_4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
] as const;

/**
 * The Bayer threshold of a cell, from 0 up to but not including 1. A tone above
 * it gets the light color, so a smooth tone becomes a dot pattern.
 *
 * @example
 * bayer(0, 0); // => 0
 * bayer(1, 0); // => 0.5
 */
export function bayer(x: number, y: number) {
	return (BAYER_4[((y % 4) + 4) % 4]?.[((x % 4) + 4) % 4] ?? 0) / 16;
}
