/** The shared vertex shader: it passes the view normal and the model position to the fragment. */
export const VERTEX_SHADER = `
varying vec3 vNormalView;
varying vec3 vObjectPosition;
void main() {
	vObjectPosition = position;
	vNormalView = normalize(normalMatrix * normal);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/**
 * The dither look: a 4×4 Bayer pattern puts each surface into four tones of
 * the header shrimp's pink. The darkest tone becomes a stipple of see-through
 * dots, the way the drawing fades into the water.
 */
export const DITHER_FRAGMENT_SHADER = `
uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3; uniform vec3 cBlot;
uniform vec3 uLight; uniform float uPix; uniform float uTone; uniform float uMottle; uniform float uCarapace;
varying vec3 vNormalView; varying vec3 vObjectPosition;
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x) {
	vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
	           mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
void main() {
	vec3 n = normalize(vNormalView);
	if (!gl_FrontFacing) n = -n;
	float lambert = max(dot(n, normalize(uLight)), 0.0);
	float rim = pow(1.0 - abs(n.z), 2.5);
	float mottle = (noise(vObjectPosition * 7.0) * 0.65 + noise(vObjectPosition * 19.0) * 0.35) * uMottle;
	// The carapace (the front of the body) reads lighter and creamier, the abdomen pinker.
	float carapace = uCarapace * smoothstep(-0.05, -0.45, vObjectPosition.x);
	float intensity = 0.12 + 0.78 * lambert + 0.42 * rim + uTone + 0.12 * carapace - 0.1 * mottle;
	vec2 cell = floor(gl_FragCoord.xy / uPix);
	float level = clamp(floor(intensity * 3.0 + bayer4(cell)), 0.0, 3.0);
	if (level < 0.5) {
		if (mod(cell.x + cell.y, 2.0) < 1.0) discard;
		gl_FragColor = vec4(c0, 1.0);
		return;
	}
	vec3 color = level < 1.5 ? c1 : (level < 2.5 ? c2 : c3);
	color = mix(color, cBlot, mottle * 0.9 * step(1.5, level) * (1.0 - 0.6 * carapace));
	gl_FragColor = vec4(color, 1.0);
}`;

/** The eyes: black with one hard specular dot. */
export const EYE_FRAGMENT_SHADER = `
uniform vec3 uLight; uniform float uPix; varying vec3 vNormalView; varying vec3 vObjectPosition;
void main() {
	vec3 n = normalize(vNormalView);
	vec3 halfway = normalize(normalize(uLight) + vec3(0.0, 0.0, 1.0));
	float specular = pow(max(dot(n, halfway), 0.0), 40.0);
	gl_FragColor = vec4(specular > 0.5 ? vec3(1.0, 0.95, 0.9) : vec3(0.06, 0.03, 0.04), 1.0);
}`;

/** A soft blush glow on the floor under the shrimp. */
export const GLOW_VERTEX_SHADER = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const GLOW_FRAGMENT_SHADER = `
varying vec2 vUv;
void main() {
	float distanceFromCenter = length((vUv - 0.5) * 2.0);
	gl_FragColor = vec4(1.0, 0.69, 0.67, 0.16 * (1.0 - smoothstep(0.0, 1.0, distanceFromCenter)));
}`;
