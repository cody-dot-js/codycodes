import { describe, expect, it } from "vitest";

import { weekday } from "./calendar.ts";

describe("weekday", () => {
	it("counts from Sunday, in UTC", () => {
		expect([weekday("2025-11-02"), weekday("2026-11-04")]).toStrictEqual([0, 3]);
	});
});
