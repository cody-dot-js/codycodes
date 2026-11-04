import {
	//,
	BufferAttribute,
	BufferGeometry,
	CatmullRomCurve3,
	Color,
	CylinderGeometry,
	DoubleSide,
	Group,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Raycaster,
	Scene,
	ShaderMaterial,
	SphereGeometry,
	Vector2,
	Vector3,
	WebGLRenderer,
} from "three";

import { shortestTurn } from "./angles.ts";
import { stepSpring } from "./spring.ts";
import {
	//,
	DITHER_FRAGMENT_SHADER,
	EYE_FRAGMENT_SHADER,
	GLOW_FRAGMENT_SHADER,
	GLOW_VERTEX_SHADER,
	VERTEX_SHADER,
} from "./shaders.ts";

const TAU = Math.PI * 2;
/** The most laps that clicks can queue. */
export const MAX_LAPS = 3;

/** What the tank tells its React shell. */
export type ShrimpTankEvents = {
	/** Runs after each pet (a click or a key press on the shrimp), with the total since mount. */
	onPet: (pets: number) => void;
};

/** CSS px from the shrimp at which he notices the cursor and swims toward it. */
const FOLLOW_RADIUS = 260;

/** The heart the pets make, as rows of cells. Why 7×6: it reads as a heart at 2 px cells. */
const HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."] as const;

/** A 4×4 Bayer matrix, so a heart fades out in the same ordered dither as the bubbles. */
const BAYER_4 = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
] as const;

/** True when a click lands on a link, a button, or a field, which the shrimp must not take. */
function isInteractive(target: EventTarget | null): boolean {
	return (
		target instanceof Element &&
		target.closest("a, button, input, select, textarea, summary, label") != null
	);
}

/** The handle that `mountShrimpTank` returns. */
export type ShrimpTank = {
	/** Stops the loop, removes the listeners, and frees the GPU memory. */
	dispose: () => void;
};

function smoothstep({ from, to, value }: { from: number; to: number; value: number }) {
	const clamped = Math.min(1, Math.max(0, (value - from) / (to - from)));
	return clamped * clamped * (3 - 2 * clamped);
}

/**
 * A tube with an elliptical cross-section that `fillSweep` sweeps along a
 * curve. The vertex buffer is written again in place on each frame.
 */
type Sweep = { geometry: BufferGeometry; rings: number; sides: number };

function makeSweep({ rings, sides }: { rings: number; sides: number }): Sweep {
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(new Float32Array(rings * sides * 3), 3));
	const indices: number[] = [];
	for (let ring = 0; ring < rings - 1; ring++) {
		for (let side = 0; side < sides; side++) {
			const a = ring * sides + side;
			const b = ring * sides + ((side + 1) % sides);
			indices.push(a, a + sides, b, b, a + sides, b + sides);
		}
	}
	geometry.setIndex(indices);
	return { geometry, rings, sides };
}

/** The frame at one point of a curve: its center, its up axis, and its side axis. */
type Frame = { center: Vector3; up: Vector3; across: Vector3; tangent: Vector3 };
/** The radii of a cross-section: up, down, and to the side. */
type Radii = readonly [number, number, number];

const frame: Frame = {
	center: new Vector3(),
	up: new Vector3(),
	across: new Vector3(),
	tangent: new Vector3(),
};

function fillSweep({
	sweep,
	setFrame,
	radii,
}: {
	sweep: Sweep;
	setFrame: (progress: number) => void;
	radii: (progress: number) => Radii;
}) {
	const position = sweep.geometry.getAttribute("position");
	if (!(position instanceof BufferAttribute)) {
		throw new TypeError("A sweep geometry has a position buffer.");
	}
	const values = position.array;
	let offset = 0;
	for (let ring = 0; ring < sweep.rings; ring++) {
		const progress = ring / (sweep.rings - 1);
		setFrame(progress);
		const [radiusUp, radiusDown, radiusSide] = radii(progress);
		for (let side = 0; side < sweep.sides; side++) {
			const angle = (side / sweep.sides) * TAU;
			const sine = Math.sin(angle);
			const cosine = Math.cos(angle);
			const radiusY = sine >= 0 ? radiusUp : radiusDown;
			const { across, center, up } = frame;
			values[offset++] = center.x + up.x * radiusY * sine + across.x * radiusSide * cosine;
			values[offset++] = center.y + up.y * radiusY * sine + across.y * radiusSide * cosine;
			values[offset++] = center.z + up.z * radiusY * sine + across.z * radiusSide * cosine;
		}
	}
	position.needsUpdate = true;
	sweep.geometry.computeVertexNormals();
	sweep.geometry.computeBoundingSphere();
}

/** A parallel-transport frame along a thin curved limb. */
function limbFrame(curve: CatmullRomCurve3) {
	const previousUp = new Vector3(0, 1, 0);
	return (progress: number) => {
		curve.getPoint(progress, frame.center);
		curve.getTangent(progress, frame.tangent);
		frame.across.crossVectors(frame.tangent, previousUp);
		if (frame.across.lengthSq() < 1e-6) {
			frame.across.set(0, 0, 1);
		}
		frame.across.normalize();
		frame.up.crossVectors(frame.across, frame.tangent).normalize();
		previousUp.copy(frame.up);
	};
}

function toVectors(points: [number, number][]) {
	return points.map(([x, y]) => new Vector3(x, y, 0));
}

/**
 * The radius along the body, head (0) to tail (1): a carapace, then six
 * abdominal segments with ridges and grooves.
 */
function bodyRadii(progress: number): Radii {
	let radius = 0;
	if (progress < 0.06) {
		radius = 0.05 + 0.13 * smoothstep({ from: 0, to: 0.06, value: progress });
	} else if (progress < 0.42) {
		radius = 0.18 + 0.04 * Math.sin((Math.PI * (progress - 0.06)) / 0.36);
	} else {
		const abdomen = (progress - 0.42) / 0.58;
		radius = 0.19 * (1 - abdomen) + 0.06 * abdomen;
		if (progress < 0.44) {
			radius *= 0.9;
		}
		if (abdomen < 0.9) {
			const segment = (abdomen / 0.9) * 6;
			const withinSegment = segment - Math.floor(segment);
			const groove = withinSegment < 0.1 ? 0.06 * (1 - withinSegment / 0.1) : 0;
			radius *= 1 + 0.07 * Math.sin(Math.PI * withinSegment) - groove;
		} else {
			radius *= 1 - 0.55 * smoothstep({ from: 0.9, to: 1, value: abdomen });
		}
	}
	const down = progress < 0.43 ? 1.3 : 1.15;
	return [radius, radius * down, radius * 0.7];
}

/**
 * Mounts the 3D shrimp in a tank button. A pet (a click on the shrimp, or a key
 * press on the focused tank) makes him squint, float hearts, and swim a happy
 * lap, up to `MAX_LAPS` queued. He blinks now and then, and swims toward a
 * cursor within `FOLLOW_RADIUS`. With reduced motion, a pet gives a wiggle and
 * two hearts, and he does not follow. The loop runs only while the tank is on
 * screen and the tab is visible.
 *
 * @returns The handle, or `null` when the browser has no WebGL.
 *
 * @example
 * const tank = mountShrimpTank({ tank: button, bubbles: canvas, onPet });
 * tank?.dispose();
 */
export function mountShrimpTank({
	tank,
	bubbles: bubbleCanvas,
	speech,
	onPet,
}: ShrimpTankEvents & {
	tank: HTMLButtonElement;
	bubbles: HTMLCanvasElement;
	/** The speech bubble's anchor. The scene moves it to the head on each frame. */
	speech: HTMLElement;
}): ShrimpTank | null {
	let renderer: WebGLRenderer;
	try {
		renderer = new WebGLRenderer({ alpha: true, antialias: false });
	} catch {
		return null;
	}
	const bubbleContext = bubbleCanvas.getContext("2d");
	if (bubbleContext == null) {
		renderer.dispose();
		return null;
	}
	renderer.setClearColor(0x000000, 0);
	renderer.domElement.setAttribute("aria-hidden", "true");
	renderer.domElement.className = "absolute inset-0 z-[1] block size-full";
	tank.prepend(renderer.domElement);

	const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
	const scene = new Scene();
	const camera = new PerspectiveCamera(32, 2, 0.1, 100);
	const disposables: { dispose: () => void }[] = [renderer];

	// ---------- materials ----------
	const palette = {
		deep: new Color("#2b1218"),
		salmon: new Color("#b8616d"),
		blush: new Color("#ffb1aa"),
		cream: new Color("#fff1e4"),
		blot: new Color("#e8858f"),
	};
	const shared = {
		uPix: { value: 2 },
		uLight: { value: new Vector3(-0.45, 0.75, 0.6) },
	};
	function ditherMaterial({
		tone,
		mottle,
		carapace,
	}: {
		tone: number;
		mottle: number;
		carapace: number;
	}) {
		const material = new ShaderMaterial({
			vertexShader: VERTEX_SHADER,
			fragmentShader: DITHER_FRAGMENT_SHADER,
			side: DoubleSide,
			uniforms: {
				c0: { value: palette.deep },
				c1: { value: palette.salmon },
				c2: { value: palette.blush },
				c3: { value: palette.cream },
				cBlot: { value: palette.blot },
				uLight: shared.uLight,
				uPix: shared.uPix,
				uTone: { value: tone },
				uMottle: { value: mottle },
				uCarapace: { value: carapace },
			},
		});
		disposables.push(material);
		return material;
	}
	const shellMaterial = ditherMaterial({ tone: 0.02, mottle: 1, carapace: 1 });
	const limbMaterial = ditherMaterial({ tone: 0.08, mottle: 0.5, carapace: 0 });
	const fanMaterial = ditherMaterial({ tone: 0, mottle: 1, carapace: 0 });
	const eyeMaterial = new ShaderMaterial({
		vertexShader: VERTEX_SHADER,
		fragmentShader: EYE_FRAGMENT_SHADER,
		uniforms: { uLight: shared.uLight, uPix: shared.uPix },
	});
	disposables.push(eyeMaterial);

	function addMesh(parent: Group, geometry: BufferGeometry, material: ShaderMaterial) {
		const mesh = new Mesh(geometry, material);
		parent.add(mesh);
		disposables.push(geometry);
		return mesh;
	}

	// ---------- the shrimp ----------
	// Three nested groups: `orbit` is the place on the lap and the yaw, `bank` is the bank and the
	// pitch, and `model` is the centered model, with the head toward -x.
	const orbit = new Group();
	const bank = new Group();
	const model = new Group();
	orbit.add(bank);
	bank.add(model);
	model.position.x = 0.45;
	scene.add(orbit);

	// The spine runs from the head (0) to the tail (1). The abdomen arches down, like a resting shrimp.
	const restingSpine = toVectors([
		[-1.25, 0.06],
		[-0.8, 0.14],
		[-0.3, 0.16],
		[0.15, 0.12],
		[0.62, -0.01],
		[1, -0.24],
		[1.22, -0.56],
	]);
	const spinePoints = restingSpine.map((point) => point.clone());
	let spine = new CatmullRomCurve3(spinePoints, false, "centripetal");
	const zAxis = new Vector3(0, 0, 1);
	function spineFrame(progress: number) {
		spine.getPoint(progress, frame.center);
		spine.getTangent(progress, frame.tangent);
		frame.up.set(-frame.tangent.y, frame.tangent.x, 0).normalize();
		frame.across.copy(zAxis);
	}
	const body = makeSweep({ rings: 96, sides: 22 });
	const bodyMesh = addMesh(model, body.geometry, shellMaterial);

	// The rostrum: a slim spike forward from the head that curves up at the tip.
	const rostrum = makeSweep({ rings: 24, sides: 8 });
	fillSweep({
		sweep: rostrum,
		setFrame: limbFrame(
			new CatmullRomCurve3(
				toVectors([
					[-1.12, 0.12],
					[-1.38, 0.15],
					[-1.62, 0.2],
					[-1.78, 0.26],
				]),
			),
		),
		radii: (progress) => {
			const radius = 0.045 * (1 - 0.92 * progress);
			return [radius, radius * 0.8, radius * 0.55];
		},
	});
	addMesh(model, rostrum.geometry, shellMaterial);

	// The eyes, on short stalks. A blink or a happy squint scales them flat.
	const eyes: Mesh[] = [];
	for (const side of [-1, 1]) {
		const eye = addMesh(model, new SphereGeometry(0.075, 16, 12), eyeMaterial);
		eyes.push(eye);
		eye.position.set(-1.08, 0.12, 0.15 * side);
		const stalk = addMesh(model, new CylinderGeometry(0.03, 0.04, 0.12, 8), limbMaterial);
		stalk.position.set(-1.06, 0.1, 0.09 * side);
		stalk.rotation.x = (Math.PI / 2) * side * 0.8;
	}

	// The antennae: two long, two short. The control points sway with the whisker phase.
	const antennae = [
		{
			side: 1,
			length: 1,
			radius: 0.014,
			points: [
				[-1.1, 0.05],
				[-1.65, 0.24],
				[-2.3, 0.16],
				[-2.8, -0.12],
				[-3.05, -0.5],
			],
		},
		{
			side: -1,
			length: 1,
			radius: 0.014,
			points: [
				[-1.1, 0.05],
				[-1.6, 0.28],
				[-2.25, 0.24],
				[-2.75, 0],
				[-3, -0.38],
			],
		},
		{
			side: 1,
			length: 0.5,
			radius: 0.01,
			points: [
				[-1.14, 0.09],
				[-1.42, 0.23],
				[-1.72, 0.29],
				[-1.96, 0.25],
			],
		},
		{
			side: -1,
			length: 0.5,
			radius: 0.01,
			points: [
				[-1.14, 0.09],
				[-1.4, 0.26],
				[-1.69, 0.33],
				[-1.94, 0.31],
			],
		},
	].map((antenna, index) => {
		const sweep = makeSweep({ rings: 40, sides: 5 });
		addMesh(model, sweep.geometry, limbMaterial);
		const resting = antenna.points.map(
			([x = 0, y = 0], point) =>
				new Vector3(x, y, antenna.side * (0.05 + 0.09 * point * antenna.length)),
		);
		return {
			radius: antenna.radius,
			sweep,
			resting,
			points: resting.map((point) => point.clone()),
			seed: index * 1.7,
		};
	});

	// The walking legs: five pairs under the carapace, each a bent limb of three points.
	const walkers = Array.from({ length: 10 }, (_, index) => {
		const sweep = makeSweep({ rings: 14, sides: 4 });
		addMesh(model, sweep.geometry, limbMaterial);
		const pair = Math.floor(index / 2);
		return { pair, side: index % 2 === 0 ? -1 : 1, sweep, progress: 0.12 + pair * 0.065 };
	});

	// The swimmerets: five pairs of paddles under the abdomen, hinged at the top.
	const leafGeometry = new SphereGeometry(1, 12, 8);
	leafGeometry.translate(0, -1, 0);
	disposables.push(leafGeometry);
	const swimmerets = Array.from({ length: 10 }, (_, index) => {
		const pair = Math.floor(index / 2);
		const hinge = new Group();
		const leaf = new Mesh(leafGeometry, limbMaterial);
		leaf.scale.set(0.014, 0.09 - pair * 0.006, 0.035);
		const tip = new Mesh(leafGeometry, limbMaterial);
		tip.scale.set(0.01, 0.07, 0.03);
		tip.position.y = -0.17 + pair * 0.012;
		hinge.add(leaf, tip);
		model.add(hinge);
		return {
			pair,
			side: index % 2 === 0 ? -1 : 1,
			hinge,
			tip,
			progress: 0.42 + 0.58 * (((pair + 0.5) / 6) * 0.9),
		};
	});

	// The tail fan: the telson in the middle and two uropods on each side, in the body's flat plane.
	const tail = new Group();
	model.add(tail);
	const fan = [0, -0.38, 0.38, -0.72, 0.72].map((spread, index) => {
		const pivot = new Group();
		const leaf = new Mesh(leafGeometry, fanMaterial);
		leaf.rotation.z = Math.PI / 2;
		leaf.scale.set(0.02, index === 0 ? 0.2 : 0.18, 0.1);
		pivot.add(leaf);
		tail.add(pivot);
		return { pivot, spread };
	});

	// An invisible hit shape around the body, for clicks.
	const hitMaterial = new MeshBasicMaterial();
	const hitGeometry = new SphereGeometry(1, 12, 8);
	disposables.push(hitMaterial, hitGeometry);
	const hit = new Mesh(hitGeometry, hitMaterial);
	hit.scale.set(1.5, 0.45, 0.35);
	hit.position.set(-0.05, -0.08, 0);
	hit.visible = false;
	model.add(hit);

	const glowGeometry = new PlaneGeometry(3.2, 1.4);
	const glowMaterial = new ShaderMaterial({
		transparent: true,
		depthWrite: false,
		vertexShader: GLOW_VERTEX_SHADER,
		fragmentShader: GLOW_FRAGMENT_SHADER,
	});
	disposables.push(glowGeometry, glowMaterial);
	const glow = new Mesh(glowGeometry, glowMaterial);
	glow.rotation.x = -Math.PI / 2;
	scene.add(glow);

	// ---------- the pose on each frame ----------
	// Why this lag: the rear pair of swimmerets leads, and each pair lags the next by 18% of a stroke.
	const strokeLag = TAU * 0.18;
	function pose({
		time,
		whisker,
		beat,
		energy,
	}: {
		time: number;
		whisker: number;
		beat: number;
		energy: number;
	}) {
		// Why straighten at speed: a shrimp swims forward on its swimmerets with the abdomen held out
		// straight and the tail fan open. A curl of the abdomen is the backward escape flip, so the
		// abdomen only breathes at rest and ripples a little with each power stroke.
		const swimming = smoothstep({ from: 0.2, to: 0.8, value: energy });
		const flex =
			0.05 * Math.sin(time * 1.1) * (1 - swimming) -
			0.24 * swimming +
			0.025 * swimming * Math.sin(beat);
		const pivot = restingSpine[3] ?? new Vector3();
		const weights = [0.45, 0.75, 1];
		for (const [offset, weight] of weights.entries()) {
			const resting = restingSpine[offset + 4];
			const point = spinePoints[offset + 4];
			if (resting == null || point == null) {
				continue;
			}
			const angle = -flex * weight;
			const dx = resting.x - pivot.x;
			const dy = resting.y - pivot.y;
			point.set(
				pivot.x + dx * Math.cos(angle) - dy * Math.sin(angle),
				pivot.y + dx * Math.sin(angle) + dy * Math.cos(angle),
				0,
			);
		}
		spine = new CatmullRomCurve3(spinePoints, false, "centripetal");
		fillSweep({ sweep: body, setFrame: spineFrame, radii: bodyRadii });

		// The antennae sway, more toward the tips, and stream back at speed.
		for (const antenna of antennae) {
			for (const [index, point] of antenna.points.entries()) {
				const resting = antenna.resting[index];
				if (resting == null) {
					continue;
				}
				const lever = (index / (antenna.points.length - 1)) ** 1.5;
				point.copy(resting);
				point.y += lever * (0.12 + 0.1 * energy) * Math.sin(whisker + antenna.seed - index * 0.6);
				point.z += lever * 0.08 * Math.sin(whisker * 0.7 + antenna.seed);
				point.x += lever * 0.25 * energy;
			}
			fillSweep({
				sweep: antenna.sweep,
				setFrame: limbFrame(new CatmullRomCurve3(antenna.points)),
				radii: (progress) => {
					const radius = antenna.radius * (1 - 0.75 * progress);
					return [radius, radius, radius];
				},
			});
		}

		// The walking legs: the hip under the carapace, the knee out and down, the foot forward. While he
		// swims, they fold back and in along the body, out of the flow.
		for (const walker of walkers) {
			spineFrame(walker.progress);
			const [, radiusDown, radiusSide] = bodyRadii(walker.progress);
			const hip = new Vector3()
				.copy(frame.center)
				.addScaledVector(frame.up, -radiusDown * 0.75)
				.addScaledVector(frame.across, walker.side * radiusSide * 0.55);
			const sway =
				0.04 * (1 - swimming) * Math.sin(whisker + walker.pair * 0.8 + (walker.side > 0 ? 0 : 1.3));
			const trail = 0.34 * swimming;
			const length = walker.pair < 2 ? 0.48 : 0.42;
			const knee = hip
				.clone()
				.add(
					new Vector3(
						-0.06 + sway + trail * 0.5,
						-length * 0.5 * (1 - 0.45 * swimming),
						walker.side * 0.16 * (1 - 0.5 * swimming),
					),
				);
			const foot = knee
				.clone()
				.add(
					new Vector3(
						-0.12 + walker.pair * 0.05 + sway + trail,
						-length * 0.55 * (1 - 0.6 * swimming),
						walker.side * 0.05,
					),
				);
			fillSweep({
				sweep: walker.sweep,
				setFrame: limbFrame(new CatmullRomCurve3([hip, knee, foot])),
				radii: (progress) => {
					const radius = 0.013 * (1 - 0.55 * progress);
					return [radius, radius, radius];
				},
			});
		}

		// The swimmerets: a power stroke toward the tail, then a folded recovery.
		const strength = 0.15 + 0.85 * energy;
		for (const swimmeret of swimmerets) {
			spineFrame(swimmeret.progress);
			const [, radiusDown, radiusSide] = bodyRadii(swimmeret.progress);
			swimmeret.hinge.position
				.copy(frame.center)
				.addScaledVector(frame.up, -radiusDown * 0.85)
				.addScaledVector(frame.across, swimmeret.side * radiusSide * 0.45);
			const phase = beat + strokeLag * (4 - swimmeret.pair);
			const stroke = strength * 0.55 * (Math.sin(phase) + 0.35 * Math.sin(2 * phase));
			const fold = (strength * Math.max(0, -(Math.cos(phase) + 0.7 * Math.cos(2 * phase)))) / 1.7;
			const bodyAngle = Math.atan2(frame.tangent.y, frame.tangent.x);
			swimmeret.hinge.rotation.set(swimmeret.side * 0.22, 0, bodyAngle + 0.35 + stroke);
			swimmeret.tip.rotation.z = 0.25 + 0.5 * fold;
		}

		// The tail fan sits at the end of the spine. It opens wide and holds still while he swims, as a
		// rudder, and folds a little at rest.
		spineFrame(1);
		tail.position.copy(frame.center);
		tail.rotation.set(0, 0, Math.atan2(frame.tangent.y, frame.tangent.x));
		for (const { pivot: leafPivot, spread } of fan) {
			leafPivot.rotation.set(
				0,
				spread * (0.75 + 0.4 * swimming + 0.04 * (1 - swimming) * Math.sin(time * 1.7)),
				0,
			);
		}
	}

	// ---------- the swim ----------
	const maxSpeed = TAU / 2.8;
	const acceleration = 3;
	const lapWidth = 1.5;
	const lapDepth = 1.5;
	const motion = {
		angle: 0,
		target: 0,
		speed: 0,
		laps: 0,
		nudge: 0,
		whisker: 0,
		beat: 0,
		energy: 0.1,
		hover: 0,
		time: 0,
		pets: 0,
		/** Seconds left in the happy squint after a pet. */
		happy: 0,
		nextBlink: 2 + Math.random() * 3,
		blinkAt: -1,
		/** How much he follows the cursor, 0 to 1. */
		follow: 0,
		/** His offset from home, on a spring in each axis. */
		swimX: { position: 0, velocity: 0 },
		swimY: { position: 0, velocity: 0 },
		/** The side he faces while he follows: -1 left, 1 right. */
		facing: -1,
		yaw: 0,
	};
	/**
	 * Where he swims to. `until` is the `motion.time` when a touch stops counting; a mouse stays
	 * until it leaves.
	 */
	const cursor = { x: 0, y: 0, near: false, until: Number.POSITIVE_INFINITY };
	const viewport = { width: 1, height: 1, pixelRatio: 1 };
	const bubbles: {
		kind: "bubble" | "heart";
		x: number;
		y: number;
		radius: number;
		rise: number;
		life: number;
		phase: number;
	}[] = [];

	function measure() {
		const rect = tank.getBoundingClientRect();
		viewport.width = Math.max(1, rect.width);
		viewport.height = Math.max(1, rect.height);
		viewport.pixelRatio = Math.min(2, devicePixelRatio || 1);
		renderer.setPixelRatio(viewport.pixelRatio);
		renderer.setSize(viewport.width, viewport.height, false);
		shared.uPix.value = 2 * viewport.pixelRatio;
		bubbleCanvas.width = Math.round(viewport.width * viewport.pixelRatio);
		bubbleCanvas.height = Math.round(viewport.height * viewport.pixelRatio);
		camera.aspect = viewport.width / viewport.height;
		// Keep the whole lap and the antennae in frame at any width.
		const halfWidth = 3.1;
		const halfHeight = 1.5;
		const tan = Math.tan(MathUtils.degToRad(camera.fov / 2));
		const distance = Math.max(halfHeight / tan, halfWidth / (tan * camera.aspect)) + 1;
		camera.position.set(0, distance * 0.2, distance);
		camera.lookAt(0, -0.15, -lapDepth * 0.75);
		camera.updateProjectionMatrix();
	}

	const tailPosition = new Vector3();
	function spawnBubbles(count: number) {
		tail.getWorldPosition(tailPosition);
		tailPosition.project(camera);
		const x = ((tailPosition.x + 1) / 2) * viewport.width;
		const y = ((1 - tailPosition.y) / 2) * viewport.height;
		for (let index = 0; index < count; index++) {
			bubbles.push({
				kind: "bubble",
				x: x + (Math.random() - 0.5) * 10,
				y,
				radius: 2 + Math.random() * 4,
				rise: -(18 + Math.random() * 26),
				life: 1,
				phase: Math.random() * TAU,
			});
		}
	}

	const headPosition = new Vector3();
	// Why a fixed width: reading the bubble's width on each frame would force a layout.
	const speechMaxWidth = 260;
	/** Moves the speech anchor to the head, so the bubble's tail points at him as he swims. */
	function placeSpeech() {
		const [eye] = eyes;
		if (eye == null) {
			return;
		}
		eye.getWorldPosition(headPosition);
		headPosition.project(camera);
		const x = ((headPosition.x + 1) / 2) * viewport.width;
		const y = ((1 - headPosition.y) / 2) * viewport.height;
		const left = MathUtils.clamp(x - 10, 0, Math.max(0, viewport.width - speechMaxWidth));
		speech.style.transform = `translate3d(${left.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
	}
	function spawnHearts(count: number) {
		const [eye] = eyes;
		if (eye == null) {
			return;
		}
		eye.getWorldPosition(headPosition);
		headPosition.project(camera);
		const x = ((headPosition.x + 1) / 2) * viewport.width;
		const y = ((1 - headPosition.y) / 2) * viewport.height;
		for (let index = 0; index < count; index++) {
			bubbles.push({
				kind: "heart",
				x: x + (Math.random() - 0.5) * 40,
				y: y - 6 - Math.random() * 14,
				radius: Math.random() < 0.35 ? 3 : 2,
				rise: -(34 + Math.random() * 30),
				life: 1 + Math.random() * 0.3,
				phase: Math.random() * TAU,
			});
		}
	}

	/** Draws one pixel heart. Cells drop out in Bayer order as it fades, so it dithers away. */
	function drawHeart({ x, y, cell, life }: { x: number; y: number; cell: number; life: number }) {
		if (bubbleContext == null) {
			return;
		}
		bubbleContext.fillStyle = "rgb(255, 177, 170)";
		for (const [row, cells] of HEART.entries()) {
			for (let column = 0; column < cells.length; column++) {
				const threshold = (BAYER_4[row % 4]?.[column % 4] ?? 0) / 16;
				if (cells[column] === "#" && threshold < life) {
					bubbleContext.fillRect(
						Math.round(x + (column - 3) * cell),
						Math.round(y + (row - 3) * cell),
						cell,
						cell,
					);
				}
			}
		}
	}

	function drawBubbles(delta: number) {
		bubbleContext?.setTransform(viewport.pixelRatio, 0, 0, viewport.pixelRatio, 0, 0);
		bubbleContext?.clearRect(0, 0, viewport.width, viewport.height);
		for (let index = bubbles.length - 1; index >= 0; index--) {
			const bubble = bubbles[index];
			if (bubble == null) {
				continue;
			}
			bubble.life -= delta * 0.55;
			bubble.y += bubble.rise * delta;
			bubble.phase += delta * 3;
			if (bubble.life <= 0 || bubble.y < -10) {
				bubbles.splice(index, 1);
				continue;
			}
			const x = bubble.x + 3 * Math.sin(bubble.phase);
			if (bubble.kind === "heart") {
				drawHeart({ x, y: bubble.y, cell: bubble.radius, life: Math.min(1, bubble.life) });
				continue;
			}
			const dots = Math.max(6, Math.round(bubble.radius * 2.4));
			if (bubbleContext == null) {
				continue;
			}
			bubbleContext.fillStyle = `rgba(169, 200, 209, ${0.75 * bubble.life})`;
			for (let dot = 0; dot < dots; dot++) {
				if ((dot + Math.floor(bubble.phase)) % 3 === 0) {
					continue;
				}
				const angle = (dot / dots) * TAU;
				bubbleContext.fillRect(
					Math.round(x + bubble.radius * Math.cos(angle)),
					Math.round(bubble.y + bubble.radius * Math.sin(angle)),
					1.5,
					1.5,
				);
			}
			bubbleContext.fillStyle = `rgba(255, 248, 241, ${0.8 * bubble.life})`;
			bubbleContext.fillRect(
				Math.round(x - bubble.radius * 0.35),
				Math.round(bubble.y - bubble.radius * 0.35),
				1.5,
				1.5,
			);
		}
	}

	function render(delta: number) {
		motion.time += delta;
		const remaining = motion.target - motion.angle;
		if (remaining > 0.002) {
			const wanted = Math.max(0.6, Math.min(maxSpeed, Math.sqrt(2 * acceleration * remaining)));
			motion.speed +=
				Math.sign(wanted - motion.speed) *
				Math.min(Math.abs(wanted - motion.speed), acceleration * 1.5 * delta);
			motion.angle = Math.min(motion.target, motion.angle + motion.speed * delta);
		} else if (motion.target > 0) {
			motion.angle = 0;
			motion.target = 0;
			motion.speed = 0;
		}
		motion.nudge = Math.max(0, motion.nudge - delta * 1.4);
		const speed = motion.speed / maxSpeed;
		const followSpeed = Math.hypot(motion.swimX.velocity, motion.swimY.velocity);
		const wantedEnergy = Math.max(
			speed,
			0.3 * motion.hover,
			motion.nudge,
			Math.min(1, followSpeed / 2),
			0.08,
		);
		motion.energy += (wantedEnergy - motion.energy) * Math.min(1, delta * 4);
		motion.whisker += delta * TAU * (0.22 + 0.5 * motion.energy);
		motion.beat += delta * TAU * (0.5 + 2.6 * motion.energy);

		pose(motion);
		poseEyes(delta);

		// He follows a near cursor only while he rests, so a lap always comes home.
		const following =
			cursor.near && motion.time < cursor.until && motion.target === 0 && !reducedMotion.matches;
		// Why slow in: he notices the cursor over most of a second, then commits. He lets go faster.
		motion.follow +=
			((following ? 1 : 0) - motion.follow) * Math.min(1, delta * (following ? 1.6 : 2));
		// Why a spring that stiffens as he commits: the first approach is a gentle ease, and after that
		// he tracks each cursor move quickly and smoothly. With no cursor, the spring takes him home.
		const response = 2.4 + 5.6 * motion.follow * motion.follow;
		motion.swimX = stepSpring({
			state: motion.swimX,
			target: following ? cursor.x : 0,
			response,
			delta,
		});
		motion.swimY = stepSpring({
			state: motion.swimY,
			target: following ? cursor.y : 0,
			response,
			delta,
		});
		// Why a dead zone: he turns only for a clear move, so a small jitter never flips him.
		const lead = following ? cursor.x - motion.swimX.position : motion.swimX.velocity;
		if (motion.swimX.velocity > 0.25 || lead > 0.3) {
			motion.facing = 1;
		} else if (motion.swimX.velocity < -0.25 || lead < -0.3) {
			motion.facing = -1;
		}

		const sine = Math.sin(motion.angle);
		const cosine = Math.cos(motion.angle);
		orbit.position.set(
			-lapWidth * sine + motion.swimX.position,
			-0.12 * lapWidth * sine + 0.08 * Math.sin(motion.time * 1.3) + motion.swimY.position,
			-lapDepth * (1 - cosine),
		);
		// Face the way he swims. The head points to -x, so a yaw of `a` sends it to (-cos a, 0, sin a).
		const heading = Math.atan2(-lapDepth * sine, lapWidth * cosine);
		const idle =
			(0.35 + 0.25 * Math.sin(motion.time * 0.45)) * (1 - speed) +
			0.25 * motion.hover * (1 - speed);
		// Why turn around: the head points to -x, so swimming right needs a yaw of about π. He faces
		// his swim side while he follows, and while the spring carries him home after.
		const side = motion.facing === 1 ? Math.PI - 0.35 : 0.35;
		const steer = Math.max(motion.follow, Math.min(1, Math.abs(motion.swimX.velocity)));
		const wantedYaw = heading + idle + steer * (side - idle);
		// Why the short way: the lap heading wraps from −π to π at the back of the tank. A plain
		// lerp there spins him almost a full turn backward.
		motion.yaw += shortestTurn({ from: motion.yaw, to: wantedYaw }) * Math.min(1, delta * 4);
		orbit.rotation.y = motion.yaw;
		bank.rotation.x = -0.4 * speed + 0.25 * motion.nudge * Math.sin(motion.time * 20);
		// Why pitch with the climb: his nose leads up or down, so a follow reads as swimming, not sliding.
		const climb = MathUtils.clamp(motion.swimY.velocity / 1.5, -1, 1);
		bank.rotation.z = 0.04 * Math.sin(motion.time * 1.3 + 1) + 0.06 * speed - 0.35 * climb;
		glow.position.set(orbit.position.x, -1.15, orbit.position.z);
		placeSpeech();

		renderer.render(scene, camera);
		if (
			!reducedMotion.matches &&
			motion.energy > 0.3 &&
			Math.random() < motion.energy * delta * 9
		) {
			spawnBubbles(Math.random() < 0.3 ? 2 : 1);
		}
		drawBubbles(delta);
	}

	/** A blink every few seconds, and a long happy squint after a pet. */
	function poseEyes(delta: number) {
		motion.happy = Math.max(0, motion.happy - delta);
		if (motion.time >= motion.nextBlink) {
			motion.blinkAt = motion.time;
			motion.nextBlink = motion.time + 2.5 + Math.random() * 4;
		}
		const sinceBlink = motion.time - motion.blinkAt;
		// Why 0.16 s: a real blink takes 100 to 400 ms; a short one reads as cute, not sleepy.
		const blink =
			motion.blinkAt >= 0 && sinceBlink < 0.16 ? Math.sin((sinceBlink / 0.16) * Math.PI) : 0;
		const squint = motion.happy > 0 ? Math.min(1, motion.happy * 6) * 0.8 : 0;
		const closed = Math.max(blink, squint);
		for (const eye of eyes) {
			eye.scale.set(1 + 0.15 * squint, Math.max(0.12, 1 - closed), 1);
		}
	}

	// ---------- the loop ----------
	const loop = { visible: true, running: false, last: 0, frame: 0 };
	const busy = () =>
		motion.target > motion.angle || motion.nudge > 0 || motion.happy > 0 || bubbles.length > 0;
	function tick(now: number) {
		const delta = Math.min(0.05, (now - loop.last) / 1000);
		loop.last = now;
		render(delta);
		if (loop.visible && !document.hidden && (!reducedMotion.matches || busy())) {
			loop.frame = requestAnimationFrame(tick);
		} else {
			loop.running = false;
		}
	}
	function wake() {
		if (loop.running) {
			return;
		}
		if (reducedMotion.matches && !busy()) {
			render(0);
			return;
		}
		if (!loop.visible || document.hidden) {
			return;
		}
		loop.running = true;
		loop.last = performance.now();
		loop.frame = requestAnimationFrame(tick);
	}

	// Clicks count only on the shrimp. A keyboard press (detail 0) always counts.
	const raycaster = new Raycaster();
	const pointer = new Vector2();
	function onShrimp(event: MouseEvent) {
		const rect = tank.getBoundingClientRect();
		pointer.set(
			((event.clientX - rect.left) / rect.width) * 2 - 1,
			-((event.clientY - rect.top) / rect.height) * 2 + 1,
		);
		raycaster.setFromCamera(pointer, camera);
		return raycaster.intersectObjects([hit, bodyMesh], false).length > 0;
	}
	function pet() {
		motion.pets += 1;
		motion.happy = 0.9;
		onPet(motion.pets);
		if (reducedMotion.matches) {
			motion.nudge = 1;
			spawnHearts(2);
			wake();
			return;
		}
		spawnHearts(6);
		if (Math.ceil((motion.target - motion.angle) / TAU - 1e-6) < MAX_LAPS) {
			motion.target = motion.target > motion.angle ? motion.target + TAU : TAU;
		}
		wake();
	}
	/** Aims him at a pointer that is near him but not on him. Call it after `onShrimp`. */
	function aimAt({ event, over }: { event: PointerEvent; over: boolean }) {
		const rect = tank.getBoundingClientRect();
		orbit.getWorldPosition(headPosition);
		headPosition.project(camera);
		const shrimpX = rect.left + ((headPosition.x + 1) / 2) * rect.width;
		const shrimpY = rect.top + ((1 - headPosition.y) / 2) * rect.height;
		cursor.near = Math.hypot(event.clientX - shrimpX, event.clientY - shrimpY) < FOLLOW_RADIUS;
		// Why hold still while the pointer is on him: a shrimp that slides away is hard to pet.
		if (cursor.near && !over) {
			// Why stop short: he swims toward the pointer, not onto it, and stays inside his tank.
			cursor.x = MathUtils.clamp(pointer.x * 2.4 * 0.7, -1.6, 1.6);
			cursor.y = MathUtils.clamp(pointer.y * 0.9 * 0.7, -0.45, 0.45);
		}
	}
	// Why pointer events on the window: the tank sits behind the page text, so the page gets the
	// pointer first. iOS Safari sends no `click` for a tap on a plain element, but it sends
	// `pointerup`. A tap counts when it lands on the shrimp and not on a link or a button.
	const press = { x: 0, y: 0, time: 0, active: false };
	function handlePointerDown(event: PointerEvent) {
		press.x = event.clientX;
		press.y = event.clientY;
		press.time = event.timeStamp;
		press.active = event.isPrimary;
	}
	function handlePointerUp(event: PointerEvent) {
		const tap =
			press.active &&
			Math.hypot(event.clientX - press.x, event.clientY - press.y) < 12 &&
			event.timeStamp - press.time < 600;
		press.active = false;
		if (!tap || isInteractive(event.target)) {
			return;
		}
		const over = onShrimp(event);
		if (over) {
			pet();
			return;
		}
		// Why a touch timer: a finger leaves no hover, so a tap near him draws him over for a while.
		if (event.pointerType !== "mouse") {
			aimAt({ event, over });
			cursor.until = motion.time + 3;
			if (cursor.near) {
				wake();
			}
		}
	}
	// A key press on the focused tank (detail 0) always counts.
	function handleKeyClick(event: MouseEvent) {
		if (event.detail === 0) {
			pet();
		}
	}
	function handlePointerMove(event: PointerEvent) {
		// Why mouse only: a touch move scrolls the page; it is not a cursor to follow.
		if (event.pointerType !== "mouse") {
			return;
		}
		const rect = tank.getBoundingClientRect();
		if (rect.bottom < 0 || rect.top > innerHeight) {
			return;
		}
		const over = onShrimp(event) && !isInteractive(event.target);
		document.documentElement.dataset.overShrimp = String(over);
		motion.hover = over ? 1 : 0;
		cursor.until = Number.POSITIVE_INFINITY;
		aimAt({ event, over });
		if (over || cursor.near) {
			wake();
		}
	}
	function handlePointerLeave() {
		motion.hover = 0;
		cursor.near = false;
		document.documentElement.dataset.overShrimp = "false";
	}

	tank.addEventListener("click", handleKeyClick);
	addEventListener("pointerdown", handlePointerDown, { passive: true });
	addEventListener("pointerup", handlePointerUp, { passive: true });
	addEventListener("pointermove", handlePointerMove, { passive: true });
	document.documentElement.addEventListener("pointerleave", handlePointerLeave);
	document.addEventListener("visibilitychange", wake);
	reducedMotion.addEventListener("change", wake);
	const intersection = new IntersectionObserver(([entry]) => {
		loop.visible = entry?.isIntersecting ?? false;
		wake();
	});
	intersection.observe(tank);
	const resize = new ResizeObserver(() => {
		measure();
		if (!loop.running) {
			render(0);
		}
	});
	resize.observe(tank);
	measure();
	render(0);
	wake();

	return {
		dispose() {
			cancelAnimationFrame(loop.frame);
			tank.removeEventListener("click", handleKeyClick);
			removeEventListener("pointerdown", handlePointerDown);
			removeEventListener("pointerup", handlePointerUp);
			removeEventListener("pointermove", handlePointerMove);
			document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
			delete document.documentElement.dataset.overShrimp;
			document.removeEventListener("visibilitychange", wake);
			reducedMotion.removeEventListener("change", wake);
			intersection.disconnect();
			resize.disconnect();
			for (const disposable of disposables) {
				disposable.dispose();
			}
			renderer.domElement.remove();
		},
	};
}
