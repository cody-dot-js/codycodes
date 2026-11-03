// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShrimpTank } from "./shrimp-tank.tsx";

describe("the shrimp tank", () => {
	it("shows the text fallback when the browser has no WebGL", async () => {
		render(<ShrimpTank />);

		await expect(screen.findByText("the shrimp needs WebGL")).resolves.toBeInstanceOf(HTMLElement);
		expect(screen.getByRole("button", { name: "Make the shrimp swim a lap" })).toBeInstanceOf(
			HTMLButtonElement,
		);
	});
});
