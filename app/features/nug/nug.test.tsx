// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Nug } from "./nug.tsx";

describe("nug", () => {
	it("starts his plug walk on the third quick pet", () => {
		render(<Nug size={88} className="" />);
		const nug = screen.getByRole("button", { name: "Pet Nug" });

		fireEvent.click(nug);
		fireEvent.click(nug);
		expect(nug.dataset.plugWalk).toBeUndefined();

		fireEvent.click(nug);
		expect(nug.dataset.plugWalk).toBe("true");
	});
});
