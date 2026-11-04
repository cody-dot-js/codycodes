// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { playNugBeat } from "./beat.ts";
import { Nug } from "./nug.tsx";

vi.mock(import("./beat.ts"), async (importOriginal) => ({
	...(await importOriginal()),
	playNugBeat: vi.fn<typeof playNugBeat>(),
}));

describe("nug", () => {
	it("starts his nug walk and its beat on the third quick pet, once", () => {
		render(<Nug size={88} className="" />);
		const nug = screen.getByRole("button", { name: "Pet Nug" });

		fireEvent.click(nug);
		fireEvent.click(nug);
		expect(nug.dataset.nugWalk).toBeUndefined();
		expect(playNugBeat).not.toHaveBeenCalled();

		fireEvent.click(nug);
		fireEvent.click(nug);
		expect(nug.dataset.nugWalk).toBe("true");
		expect(playNugBeat).toHaveBeenCalledTimes(1);
	});
});
