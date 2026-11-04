/**
 * The signed turn from one angle to another, the short way round, in
 * radians from −π to π. Angles that differ by a full turn give 0.
 *
 * @example
 * shortestTurn({ from: 3.1, to: -3.1 }); // => about 0.083, not -6.2
 */
export function shortestTurn({ from, to }: { from: number; to: number }) {
	const difference = to - from;
	return Math.atan2(Math.sin(difference), Math.cos(difference));
}
