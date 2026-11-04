import { useEffect, useRef } from "react";

import { DOT_RADIUS, LOOP_SECONDS, oceanFrame } from "./ocean.ts";

/** The ocean moves slowly, so 15 frames a second looks smooth and costs a quarter of 60. */
const FRAME_MS = 1000 / 15;

/**
 * The brand's ordered-dither ocean, drawn on a canvas that fills its parent.
 * It loops every 24 s while it is on screen and the tab is visible. With
 * reduced motion, it draws one still frame.
 *
 * @example
 * <div className="relative h-64"><DitherOcean /></div>
 */
export function DitherOcean() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas?.getContext("2d");
		if (canvas == null || context == null) {
			return;
		}
		const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
		const state = { visible: false, frame: 0, last: 0, start: performance.now() };

		function draw(now: number) {
			if (canvas == null || context == null) {
				return;
			}
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			const pixelRatio = Math.min(2, devicePixelRatio || 1);
			if (canvas.width !== Math.round(width * pixelRatio)) {
				canvas.width = Math.round(width * pixelRatio);
				canvas.height = Math.round(height * pixelRatio);
			}
			context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
			context.clearRect(0, 0, width, height);
			const phase = reducedMotion.matches ? 0 : ((now - state.start) / 1000 / LOOP_SECONDS) % 1;
			for (const [color, points] of oceanFrame({ width, height, phase })) {
				context.fillStyle = color;
				context.beginPath();
				for (let index = 0; index < points.length; index += 2) {
					const x = points[index] ?? 0;
					const y = points[index + 1] ?? 0;
					context.moveTo(x + DOT_RADIUS, y);
					context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
				}
				context.fill();
			}
		}

		function tick(now: number) {
			state.frame = 0;
			if (!state.visible || document.hidden) {
				return;
			}
			if (now - state.last >= FRAME_MS) {
				state.last = now;
				draw(now);
			}
			if (!reducedMotion.matches) {
				state.frame = requestAnimationFrame(tick);
			}
		}

		function wake() {
			if (state.frame === 0) {
				state.last = 0;
				state.frame = requestAnimationFrame(tick);
			}
		}

		const intersection = new IntersectionObserver(([entry]) => {
			state.visible = entry?.isIntersecting ?? false;
			wake();
		});
		const resize = new ResizeObserver(() => {
			draw(performance.now());
		});
		intersection.observe(canvas);
		resize.observe(canvas);
		document.addEventListener("visibilitychange", wake);
		reducedMotion.addEventListener("change", wake);
		return () => {
			cancelAnimationFrame(state.frame);
			intersection.disconnect();
			resize.disconnect();
			document.removeEventListener("visibilitychange", wake);
			reducedMotion.removeEventListener("change", wake);
		};
	}, []);

	return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />;
}
