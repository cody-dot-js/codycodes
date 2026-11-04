import { useEffect } from "react";

/** The frames in `/favicon-swim.webp`, side by side: one pet, a happy lap, and a rest. */
const FRAMES = 36;
/** The frame rate that the frames were recorded at. */
const FPS = 12;
/** The width and height of one frame, in pixels. */
const FRAME_SIZE = 64;

/**
 * Animates the tab icon: the 3D shrimp from the home page gets a pet, floats
 * hearts, and swims a lap. The frames are a recording of the real scene, so
 * the tab plays a 20 kB image and runs no WebGL. It starts after the page
 * loads, pauses while the tab is hidden, and stays still with reduced motion.
 * `/favicon.ico` is the still icon before and without it.
 *
 * @example
 * <SwimmingFavicon />
 */
export function SwimmingFavicon() {
	useEffect(() => {
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		const link = document.createElement("link");
		link.rel = "icon";
		link.type = "image/png";
		const state: { frames: string[]; index: number; timer?: ReturnType<typeof setInterval> } = {
			frames: [],
			index: 0,
		};

		function play() {
			clearInterval(state.timer);
			if (document.hidden || state.frames.length === 0) {
				return;
			}
			state.timer = setInterval(() => {
				state.index = (state.index + 1) % state.frames.length;
				link.href = state.frames[state.index] ?? link.href;
			}, 1000 / FPS);
		}

		const sprite = new Image();
		sprite.addEventListener("load", () => {
			const canvas = document.createElement("canvas");
			canvas.width = FRAME_SIZE;
			canvas.height = FRAME_SIZE;
			const context = canvas.getContext("2d");
			if (context == null) {
				return;
			}
			// Why data URLs made once: a tab icon takes a URL, and a new one for each frame would decode the sprite again.
			state.frames = Array.from({ length: FRAMES }, (_, index) => {
				context.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
				context.drawImage(
					sprite,
					index * FRAME_SIZE,
					0,
					FRAME_SIZE,
					FRAME_SIZE,
					0,
					0,
					FRAME_SIZE,
					FRAME_SIZE,
				);
				return canvas.toDataURL("image/png");
			});
			link.href = state.frames[0] ?? "";
			// Why last in the head: a browser uses the last icon link, so this one wins over the still icon.
			document.head.append(link);
			play();
		});
		// Why after load: the sprite must not compete with the page's own requests.
		function start() {
			sprite.src = "/favicon-swim.webp";
		}
		if (document.readyState === "complete") {
			start();
		} else {
			addEventListener("load", start, { once: true });
		}
		document.addEventListener("visibilitychange", play);

		return () => {
			clearInterval(state.timer);
			removeEventListener("load", start);
			document.removeEventListener("visibilitychange", play);
			link.remove();
		};
	}, []);

	return null;
}
