import { describe, expect, it } from "vitest";

import type { SpringState } from "./spring.ts";
import { stepSpring } from "./spring.ts";

function run({ response, delta, seconds }: { response: number; delta: number; seconds: number }) {
	let state: SpringState = { position: 0, velocity: 0 };
	const positions: number[] = [];
	for (let step = 0; step < Math.round(seconds / delta); step++) {
		state = stepSpring({ state, target: 1, response, delta });
		positions.push(state.position);
	}
	return positions;
}

describe("stepSpring", () => {
	it("eases onto the target with no overshoot", () => {
		const positions = run({ response: 6, delta: 1 / 60, seconds: 2 });

		expect(Math.max(...positions)).toBeLessThanOrEqual(1);
		expect(positions.at(-1)).toBeCloseTo(1, 2);
		expect(
			positions.every((value, index) => index === 0 || value >= (positions[index - 1] ?? 0)),
		).toBe(true);
	});

	it("lands in the same place at 20 and 120 frames a second", () => {
		const slow = run({ response: 6, delta: 1 / 20, seconds: 0.5 }).at(-1) ?? 0;
		const fast = run({ response: 6, delta: 1 / 120, seconds: 0.5 }).at(-1) ?? 0;

		expect(slow).toBeCloseTo(fast, 2);
	});

	it("gets there sooner with a higher response", () => {
		const gentle = run({ response: 2, delta: 1 / 60, seconds: 0.5 }).at(-1) ?? 0;
		const quick = run({ response: 8, delta: 1 / 60, seconds: 0.5 }).at(-1) ?? 0;

		expect(quick).toBeGreaterThan(gentle);
	});
});
