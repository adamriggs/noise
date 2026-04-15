import * as PIXI from 'pixi.js';
import { createNoise3D, createNoise2D } from 'simplex-noise';
import Stats from 'stats.js';
import { initParameters, parameters, parametersObjects } from './parameters';
import { returnTexture } from './sprites';

const app = new PIXI.Application();
const contentElem = document.getElementById('content');
const backgroundColor = '#3A4B4B';	// 0xABDADC.  746D69. 353E43. 2A3439
let midX = window.innerWidth / 2;
let midY = window.innerHeight / 2;
const particleContainer = new PIXI.ParticleContainer({
	dynamicProperties: {
		position: true, // default
		vertex: false,
		rotation: false,
		color: false,
	},
});

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
 * 2d noise particles variables
 */
const noise2D = createNoise2D();
let particles2d = [];
let totalparticles2d = 1;
let time2d = 0;
const speed2d = 0.005; // Lower is smoother
const range2d = 400; // Total horizontal distance

/**
 * 3d noise particles variables
 */
// const noise3D = createNoise3D();
let particles3d = [];
let totalparticles3d = 5000;

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const generateparticles = (total) => {
	let particles = [];
	for (let i = 0; i < total; i++) {
		particles[i] = {};
		particles[i].noise = createNoise3D();

		particles[i].particle = new PIXI.Particle(returnTexture(app));
		particles[i].particle.anchorX = 0.5;
		particles[i].particle.anchorY = 0.5;
		particles[i].particle.scaleX = parseInt(parameters.particleSize, 10) / 100;
		particles[i].particle.scaleY = parseInt(parameters.particleSize, 10) / 100;
		particles[i].particle.tint = colors[i % colors.length];
		particles[i].hsl = colorsHSL[i % colors.length];
		particles[i].particle.x = window.innerWidth / 2;
		particles[i].particle.y = window.innerHeight / 2;
		// particles[i].particle.x = Math.random() * window.innerWidth;
		// particles[i].particle.y = Math.random() * window.innerHeight;
		particleContainer.addParticle(particles[i].particle);
	}
	return particles;
}

const initMovement2d = () => {
	particles2d = generateparticles(totalparticles2d);
}

const movement2dStep = () => {
	// move particle in a line with a wiggle
	time2d += speed2d;
	const noiseValue = noise2D(time2d, Math.random() / 1000);
	particles2d[0].particle.x = midX + (noiseValue * range2d * 0.5);
	particles2d[0].particle.y = midY + (midY / 2);
}

const initMovement3d = () => {
	particles3d = generateparticles(totalparticles3d);
}

const movement3dStep = (deltaTime) => {
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

		const hue = particle.hsl.h * parameters.hCoeff;
		const saturation = particle.hsl.s * parameters.sCoeff;
		const lightness = particle.hsl.l * parameters.lCoeff;
		// const saturation = (particle.hsl.s / 2) + Math.abs(pointerXForce * pointerYForce);
		// const saturation = parseInt(particle.hsl.s, 10) + Math.abs(pointerXForce * pointerYForce);;
		// const lightness = parseInt(particle.hsl.l, 10) + Math.abs(pointerXForce * pointerYForce);
		const opacity = 100;

		particle.particle.tint = `hsla(${hue} ${saturation}% ${lightness}% / ${opacity}%)`;
		particle.particle.x += (velX + attractionX * parameters.attraction + pointerXForce) * deltaTime / 10;
		particle.particle.y += (velY + attractionY * parameters.attraction + pointerYForce) * deltaTime / 10;
	});
}

const initApp = async () => {
	await app.init({
		width: '100vw',
		height: '100vh',
		backgroundColor: backgroundColor,
		resizeTo: window,
	});

	contentElem.appendChild(app.canvas);

	app.stage.addChild(particleContainer);

	initParameters();
	// initMovement2d();
	initMovement3d();
}

const animate = (timestamp) => {
	stats.begin();
	if (!prevTime) {
		prevTime = timestamp;
	}
	const deltaTime = timestamp - prevTime;
	prevTime = timestamp;

	particleContainer.update();

	phase += 0.001;

	// movement2dStep();
	movement3dStep(deltaTime);

	stats.end();
	requestAnimationFrame(animate);
}

const handleResize = (event) => {

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

const getPointerCoords = (event) => {
	let x = event.clientX;
	let y = event.clientY;

	if (event.touches) {
		x = event.touches[0].clientX;
		y = event.touches[0].clientY;
	}

	return { x, y };
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

document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		console.log("Tab is hidden (user switched tabs or minimized)");
		stopAnimation();
		// canvas.addEventListener("click", () => {
		// 	if (rafId) {
		// 		cancelAnimationFrame(rafId);
		// 		rafId = null;
		// 	} else {
		// 		loop();
		// 	}
		// });
	} else {
		console.log("Tab is visible again");
		startAnimation();
	}
});


const mapRange = (value, inMin, inMax, outMin, outMax) => {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};