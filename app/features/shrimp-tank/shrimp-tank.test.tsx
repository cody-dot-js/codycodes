// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HAPPY_LINES, lineAfter } from "./lines.ts";
import { ShrimpTank } from "./shrimp-tank.tsx";

describe("the shrimp", () => {
	it("shows the text fallback when the browser has no WebGL", async () => {
		render(<ShrimpTank className="relative h-60 w-96" />);

		await expect(screen.findByText("the shrimp needs WebGL")).resolves.toBeInstanceOf(HTMLElement);
		expect(screen.getByRole("button", { name: "Pet the shrimp" })).toBeInstanceOf(
			HTMLButtonElement,
		);
	});

	it("greets first, then says a happy line for each pet, and wraps around", () => {
		expect(lineAfter(0)).toBe("hi. pet me.");
		expect(lineAfter(1)).toBe(HAPPY_LINES[0]);
		expect(lineAfter(HAPPY_LINES.length + 1)).toBe(HAPPY_LINES[0]);
	});
});
