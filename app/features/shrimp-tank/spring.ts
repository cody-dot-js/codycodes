/** A value on a spring: where it is and how fast it moves, in units per second. */
export type SpringState = { position: number; velocity: number };

/**
 * Moves a critically damped spring toward its target by one time step. It
 * uses the exact solution, so it never overshoots and stays stable at any
 * frame time. A higher `response` (in 1/s) reaches the target sooner.
 *
 * @example
 * stepSpring({ state: { position: 0, velocity: 0 }, target: 1, response: 6, delta: 1 / 60 });
 * // => { position: 0.0047, velocity: 0.55 }
 */
export function stepSpring({
	state,
	target,
	response,
	delta,
}: {
	state: SpringState;
	target: number;
	response: number;
	delta: number;
}): SpringState {
	const offset = state.position - target;
	const carry = state.velocity + response * offset;
	const decay = Math.exp(-response * delta);
	return {
		position: target + (offset + carry * delta) * decay,
		velocity: (state.velocity - response * carry * delta) * decay,
	};
}
