import * as PIXI from 'pixi.js';
import { createNoise3D, createNoise2D } from 'simplex-noise';
import Stats from 'stats.js';
import { initParameters, parameters } from './parameters';
import { returnSprite } from './sprites';

const app = new PIXI.Application();
const contentElem = document.getElementById('content');
const backgroundColor = '#3A4B4B';	// 0xABDADC.  746D69. 353E43. 2A3439
let midX = window.innerWidth / 2;
let midY = window.innerHeight / 2;

let phase = 0;
let prevTime = 0;

// const colors = ['#DBBEAB', '#789A9C', '#ABDADB', '#866D5C', '#305A5C', '#331F12'];
const colors = ['#A4D2D3', '#8AB0B1', '#ABDADB', '#6F8E8F', '#556C6D', '#3A4B4B'];

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
const noise3D = createNoise3D();
let particles3d = [];
let totalparticles3d = 10000;

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const generateparticles = (total) => {
	let particles = [];
	for (let i = 0; i < total; i++) {
		particles[i] = {};
		particles[i].angle = 0;
		particles[i].noise = createNoise3D();
		particles[i].sprite = new returnSprite(app, i);
		particles[i].sprite.anchor.set(.5, .5);
		particles[i].sprite.scale.set(parseInt(parameters.spriteSize, 10) / 100);
		particles[i].sprite.x = window.innerWidth / 2;
		particles[i].sprite.y = window.innerHeight / 2;
		// particles[i].sprite.x = Math.random() * window.innerWidth;
		// particles[i].sprite.y = Math.random() * window.innerHeight;
		app.stage.addChild(particles[i].sprite);
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
	particles2d[0].sprite.x = midX + (noiseValue * range2d * 0.5);
	particles2d[0].sprite.y = midY + (midY / 2);
}

const initMovement3d = () => {
	particles3d = generateparticles(totalparticles3d);
}

const movement3dStep = (deltaTime) => {
	// move particle in a circle with a wobble
	const xyCoeff = parameters.xyCoeff;
	const attractionForce = parameters.attractionForce;

	particles3d.forEach(particle => {
		// if (particle === particles3d[0]) { return; }	

		particle.sprite.scale.set(parseInt(parameters.spriteSize, 10) / 100);

		// const noise = particle.noise(particle.sprite.x * xyCoeff, particle.sprite.y * parameters.xyCoeff, phase);
		const noise = particle.noise(particle.sprite.x * parameters.xCoeff, particle.sprite.y * parameters.yCoeff, phase * parameters.zCoeff * 1000);

		const velX = Math.cos(noise * Math.PI * 2) * parameters.orbit;
		const velY = Math.sin(noise * Math.PI * 2) * parameters.orbit;

		const attractionX = (midX - particle.sprite.x) * (1 - parameters.velocity);
		const attractionY = (midY - particle.sprite.y) * (1 - parameters.velocity);

		particle.sprite.x += velX + attractionX * attractionForce;
		particle.sprite.y += velY + attractionY * attractionForce;
		// phase += 0.00001;
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

	phase += 0.001;

	// movement2dStep();
	movement3dStep(deltaTime);

	stats.end();
	requestAnimationFrame(animate);
}

const handleClick = (event) => {
	let eventX = event.clientX;
	let eventY = event.clientY;
	if (event.touches) {
		eventX = event.touches[0].clientX;
		eventY = event.touches[0].clientY;
	}
}

const handleResize = (event) => {

}

window.addEventListener('load', () => {
	initApp();

	requestAnimationFrame(animate);
});

window.addEventListener('resize', () => { handleResize(); });

window.addEventListener('click', handleClick, false);
document.addEventListener('touchstart', handleClick, false);

const mapRange = (value, inMin, inMax, outMin, outMax) => {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};