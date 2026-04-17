import * as PIXI from 'pixi.js';
import { createNoise3D, createNoise2D } from 'simplex-noise';
import Stats from 'stats.js';
import { initParameters, parameters, parametersObjects } from './parameters';
import { returnTexture } from './sprites';

const app = new PIXI.Application();
const contentElem = document.getElementById('content');
const backgroundColor = '#3A4B4B';	// 0xABDADC.  746D69. 353E43. 2A3439
let w = window.innerWidth;
let h = window.innerHeight;
let midX = w/ 2;
let midY = h / 2;

let phase = 0;
let prevTime = 0;
let rafId = null;	// id that request animation frame returns

let interactionPoints = [];
const POINTER_COORDS = 0;
interactionPoints[POINTER_COORDS] = null;

const colors = ['#A4D2D3', '#8AB0B1', '#ABDADB', '#6F8E8F', '#556C6D', '#3A4B4B'];
const colorsHSL = [
	{ h: '181.28', s: '34.81', l: '73.53' },
	{ h: '181.54', s: '20', l: '61.76' },
	{ h: '181.25', s: '40', l: '76.47' },
	{ h: '181.88', s: '12.6', l: '49.8' },
	{ h: '182.5', s: '12.37', l: '38.04' },
	{ h: '180', s: '12.78', l: '26.08' },
];

/**
 * 3d noise particles variables
 */
// const noise3D = createNoise3D();
let particles3d = [];
let totalParticles3d = 5000;

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const particles3dContainer = new PIXI.ParticleContainer({
	dynamicProperties: {
		position: true, // default
		vertex: false,
		rotation: false,
		color: false,
	},
});

/**
 * flow field variables
 */
let particlesField = [];
const totalParticlesField = 1000;
const noise = createNoise3D();
let colorPhase = 0;

let particlesFieldContainer;
let fieldTrailTexture;
let fieldTrailSprite;

/**
 * MAIN FUNCTIONS
 */

const generateparticles = (total, container) => {
	let particles = [];
	for (let i = 0; i < total; i++) {
		const particle = {};
		particle.noise = createNoise3D();
		particle.decayCounter = 0;

		particle.particle = new PIXI.Particle(returnTexture(app));
		particle.particle.anchorX = 0.5;
		particle.particle.anchorY = 0.5;
		particle.particle.scaleX = parseInt(parameters.particleSize, 10) / 100;
		particle.particle.scaleY = parseInt(parameters.particleSize, 10) / 100;
		particle.particle.tint = colors[i % colors.length];
		particle.hsl = colorsHSL[i % colors.length];
		particle.particle.x = w / 2;
		particle.particle.y = h / 2;
		// particle.particle.x = Math.random() * w;
		// particle.particle.y = Math.random() * h;

		particle.field = {
			x: Math.random() * w,
			y: Math.random() * h,
			velocity: 1 + Math.random(),
			opacity: 1,
			angle: 0,
			distance: 0,
		}

		// console.log(particle.field.x, particle.field.y);

		particles[i] = particle;
		container.addParticle(particles[i].particle);
	}
	return particles;
}

const initMovement3d = () => {
	particles3d = generateparticles(totalParticles3d, particles3dContainer);
}

const movement3dStep = (deltaTime) => {
	// if, instead of having the particles be attracted to the center of the viewport,
	// they were attracted to the center point of their cloud then maybe that would be 
	// boind like behavior
	particles3d.forEach(particle => {

		particle.particle.scaleX = parseInt(parameters.particleSize, 10) / 100;
		particle.particle.scaleY = parseInt(parameters.particleSize, 10) / 100;

		const noise = particle.noise(
			particle.particle.x * parameters.xCoeff,
			particle.particle.y * parameters.yCoeff,
			phase * parameters.zCoeff * 1000
		);

		const velX = Math.cos(noise * Math.PI * 2) * parameters.orbit;
		const velY = Math.sin(noise * Math.PI * 2) * parameters.orbit;

		const attractionX = (midX - particle.particle.x) * (1 - parameters.repulsion);
		const attractionY = (midY - particle.particle.y) * (1 - parameters.repulsion);

		let pointerXForce = 0;
		let pointerYForce = 0;

		if (interactionPoints[POINTER_COORDS] !== null) {
			const distance = Math.hypot(particle.particle.x - interactionPoints[POINTER_COORDS].x, particle.particle.y - interactionPoints[POINTER_COORDS].y);

			if (distance < parameters.pointerDistance) {

				const dx = particle.particle.x - interactionPoints[POINTER_COORDS].x;
				const dy = particle.particle.y - interactionPoints[POINTER_COORDS].y;

				const force = parameters.pointerForce / distance * distance;

				pointerXForce = force * (dx / distance);
				pointerYForce = force * (dy / distance);
			}
		}

		let colorDecay = .5;
		
		if (pointerXForce * pointerYForce !== 0) {
			particle.decayCounter = 50;
		}

		if (particle.decayCounter > 0) {
			colorDecay = 1;	// using decayCounter as a percentage to add to .5 isn't as dramatic as I would have hoped
			particle.decayCounter -= deltaTime;


			if (particle.decayCounter < 0) {
				particle.decayCounter = 0;
			}
		}

		const hue = (particle.hsl.h * colorDecay) * parameters.hCoeff;
		const saturation = (particle.hsl.s * colorDecay) * parameters.sCoeff;
		const lightness = (particle.hsl.l) * parameters.lCoeff + Math.abs(pointerXForce * pointerYForce);
		const opacity = 1; // this isn't set here but I keep it here just to keep the formatting of the next line

		particle.particle.tint = `hsla(${hue} ${saturation}% ${lightness}% / ${opacity}%)`;
		particle.particle.x += (velX + attractionX * parameters.attraction + pointerXForce) * deltaTime;
		particle.particle.y += (velY + attractionY * parameters.attraction + pointerYForce) * deltaTime;
	});
}

const initFlowField = () => {
	particlesField = generateparticles(totalParticlesField, particlesFieldContainer);

}

const flowFieldStep = (deltaTime) => {
	const xScale = 0.003;
	const yScale = 0.003;
	const maxDistance = 200;

	particlesField.forEach(particle => {

		const noiseValue = noise(particle.field.x * xScale, particle.field.y * yScale, phase);
		const angle = noiseValue * Math.PI * 2;

		const xVal = Math.cos(angle) * particle.field.velocity;
		const yVal = Math.sin(angle) * particle.field.velocity;

		particle.field.x += xVal * deltaTime / 1;
		particle.field.y += yVal * deltaTime / 1;

		const distance = Math.hypot(midX - particle.field.x, midY - particle.field.y);
		particle.distancePercentage = Math.min(distance / maxDistance, 1);

		particle.angle = angle;

		if (particle.field.x > w) {
			particle.field.x = 0;
		}

		if (particle.field.x < 0) {
			particle.field.x = w;
		}

		if (particle.field.y > h) {
			particle.field.y = 0;
		}

		if (particle.field.y < 0) {
			particle.field.y = h;
		}

		// const colorAngle = Math.cos(colorPhase + (particle.angle * 0.5));
		// const colorAngleMapped = mapRange(colorAngle, -1, 1, 0, 1);


		const hue = Math.abs(parseInt(particle.hsl.h, 10) + (25 * (particle.distancePercentage)));
		// const hue = parseInt(particle.hsl.h, 10);
		// const hue = 1;
		// const saturation = 50 - (20 * (particle.distancePercentage));
		const saturation = Math.min(Math.abs(parseInt(particle.hsl.s, 10) - (20 * (particle.distancePercentage))));
		// const saturation = 100;
		// const lightness = 50 - (10 * (particle.distancePercentage));
		const lightness = Math.min(Math.abs(parseInt(particle.hsl.l, 10) - (20 * (particle.distancePercentage))));
		// const lightness = 100;
		// const opacity = 0.25 - (0.1 * (particle.distancePercentage));
		const opacity = .4;

		particle.particle.tint = `hsla(${hue} ${saturation}% ${lightness}% / ${opacity}%)`;

		particle.particle.x = particle.field.x;
		particle.particle.y = particle.field.y;
		particle.particle.alpha = opacity;

		// console.log(particle.field.x, particle.particle.y);
		// console.log(hue, saturation, lightness, opacity);
		// console.log(particle.hsl);
		// console.log('*****');
	});
}

/**
 * INIT AND ANIMATE
 */

const initApp = async () => {
	await app.init({
		width: '100vw',
		height: '100vh',
		backgroundColor: backgroundColor,
		resizeTo: window,
	});

	contentElem.appendChild(app.canvas);

	particlesFieldContainer = new PIXI.ParticleContainer({
		dynamicProperties: {
			position: true, // default
			vertex: false,
			rotation: false,
			color: false,
		},
	});

	fieldTrailTexture = PIXI.RenderTexture.create({
		width: w,
		height: h
	});

	fieldTrailSprite = new PIXI.Sprite(fieldTrailTexture);

	app.stage.addChild(particlesFieldContainer);
	app.stage.addChild(fieldTrailSprite);
	app.stage.addChild(particles3dContainer);

	fieldTrailSprite.alpha = .10;

	initParameters();
	initFlowField();
	initMovement3d();
}

const animate = (timestamp) => {
	stats.begin();
	if (!prevTime) {
		prevTime = timestamp;
	}
	const deltaTime = timestamp - prevTime;
	prevTime = timestamp;

	particles3dContainer.update();
	// particlesFieldContainer.update();

	phase += 0.001;
	colorPhase += 0.002;

	const animationCoeff = 100 * Math.pow(.87, (101 - parameters.animationSpeed));	// This is fairly arbitrary to make 50 feel like the right speed
	
	movement3dStep(deltaTime * animationCoeff);
	flowFieldStep(deltaTime * animationCoeff);

	app.renderer.render({
		container: particlesFieldContainer,
		target: fieldTrailTexture,
		clear: false,
		preserveDrawingBuffer: true,
		skipUpdateTransform: false
	});

	stats.end();
	requestAnimationFrame(animate);
}

/**
 * EVENT STUFF
 */

const getPointerCoords = (event) => {
	let x = event.clientX;
	let y = event.clientY;

	if (event.touches) {
		x = event.touches[0].clientX;
		y = event.touches[0].clientY;
	}

	return { x, y };
}

const handleResize = (event) => {
	w = window.innerWidth;
	h = window.innerHeight;
}

const handleClick = (event) => {
	// const { x, y } = getPointerCoords(event);
}

const handleMove = (event) => {
	interactionPoints[POINTER_COORDS] = getPointerCoords(event);
}

const handleLeave = (event) => {
	interactionPoints[POINTER_COORDS] = null;
}

const startAnimation = () => {
	prevTime = performance.now();
	rafId = requestAnimationFrame(animate);
}

const stopAnimation = () => {
	if (rafId) {
		cancelAnimationFrame(rafId);
		rafId = null;
	} 
}

const visibilityChange = () => {
	if (document.hidden) {
		stopAnimation();
	} else {
		startAnimation();
	}
}

window.addEventListener('load', () => {
	initApp();

	startAnimation();
});

window.addEventListener('mouseover', handleMove, false);
window.addEventListener('mousemove', handleMove, false);
window.addEventListener('touchmove', handleMove, false);

window.addEventListener('mouseout', handleLeave, false);
document.addEventListener('touchend', handleLeave, false);

window.addEventListener('resize', handleResize, false);

window.addEventListener('click', handleClick, false);
document.addEventListener('touchstart', handleClick, false);

document.addEventListener("pagehide", visibilityChange, false);
document.addEventListener("pageshow", visibilityChange, false);
document.addEventListener('visibilitychange', visibilityChange, false);


const mapRange = (value, inMin, inMax, outMin, outMax) => {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};