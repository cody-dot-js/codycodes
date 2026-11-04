// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { playSound } from "~/features/sound/sound.ts";

import { playNugBeat } from "./beat.ts";
import { Nug } from "./nug.tsx";

vi.mock(import("./beat.ts"), async (importOriginal) => ({
	...(await importOriginal()),
	playNugBeat: vi.fn<typeof playNugBeat>(),
}));
vi.mock(import("~/features/sound/sound.ts"), async (importOriginal) => ({
	...(await importOriginal()),
	playSound: vi.fn<typeof playSound>(),
}));

describe("nug", () => {
	afterEach(() => {
		cleanup();
	});

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

	it("plays the pet sound for each pet", () => {
		render(<Nug size={88} className="" />);
		const nug = screen.getByRole("button", { name: "Pet Nug" });

		fireEvent.click(nug);
		fireEvent.click(nug);

		expect(vi.mocked(playSound).mock.calls).toStrictEqual([["pet"], ["pet"]]);
	});
});
