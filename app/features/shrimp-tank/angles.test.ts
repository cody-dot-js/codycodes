import { describe, expect, it } from "vitest";

import { shortestTurn } from "./angles.ts";

describe("shortestTurn", () => {
	it("turns the short way across ±π, where the lap heading wraps", () => {
		expect(shortestTurn({ from: Math.PI - 0.05, to: -Math.PI + 0.05 })).toBeCloseTo(0.1);
		expect(shortestTurn({ from: -Math.PI + 0.05, to: Math.PI - 0.05 })).toBeCloseTo(-0.1);
	});

	it("gives no turn for angles a full turn apart", () => {
		expect(shortestTurn({ from: 0.4, to: 0.4 + 4 * Math.PI })).toBeCloseTo(0);
	});
});
