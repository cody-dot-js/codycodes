// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { playSound } from "~/features/sound/sound.ts";

import { FootnoteMotion } from "./footnote-motion.tsx";

vi.mock(import("~/features/sound/sound.ts"), async (importOriginal) => ({
	...(await importOriginal()),
	playSound: vi.fn<typeof playSound>(),
}));

describe("footnote motion", () => {
	it("plays a drop for a jump to a note, and not for other links", () => {
		render(
			<>
				<FootnoteMotion />
				<a href="#user-content-fn-1" data-footnote-ref="">
					1
				</a>
				<a href="/posts">all posts</a>
			</>,
		);

		fireEvent.click(screen.getByRole("link", { name: "all posts" }));
		expect(playSound).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole("link", { name: "1" }));
		expect(playSound).toHaveBeenCalledWith("drop");
	});
});
