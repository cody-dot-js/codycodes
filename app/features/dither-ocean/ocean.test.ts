import { describe, expect, it } from "vitest";

import { CELL, oceanFrame } from "./ocean.ts";

function allPoints(frame: Map<string, number[]>) {
	return [...frame.values()].flat();
}

describe("oceanFrame", () => {
	it("ends the loop on the frame where it starts, so the loop has no seam", () => {
		const start = oceanFrame({ width: 640, height: 300, phase: 0 });
		const end = oceanFrame({ width: 640, height: 300, phase: 1 });

		expect([...end.entries()]).toStrictEqual([...start.entries()]);
	});

	it("moves the water between two phases", () => {
		const start = oceanFrame({ width: 640, height: 300, phase: 0 });
		const later = oceanFrame({ width: 640, height: 300, phase: 0.25 });

		expect([...later.entries()]).not.toStrictEqual([...start.entries()]);
	});

	it("keeps the top half of the band clear, so text above it keeps its contrast", () => {
		const points = allPoints(oceanFrame({ width: 640, height: 300, phase: 0.4 }));
		const ys = points.filter((_, index) => index % 2 === 1);

		expect(ys.length).toBeGreaterThan(0);
		expect(Math.min(...ys)).toBeGreaterThan(150);
	});

	it("puts each dot at the center of a cell", () => {
		const points = allPoints(oceanFrame({ width: 140, height: 140, phase: 0 }));

		expect(points.every((value) => (value - CELL / 2) % CELL === 0)).toBe(true);
	});
});
