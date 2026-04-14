import * as PIXI from 'pixi.js';
import { createNoise3D, createNoise2D } from 'simplex-noise';
import Stats from 'stats.js';
import { initParameters, parameters } from './parameters';
import { returnSprite, returnTexture } from './sprites';

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
		// particles[i].sprite = new returnSprite(app, i);
		// particles[i].sprite.anchor.set(.5, .5);
		// particles[i].sprite.scale.set(parseInt(parameters.particleSize, 10) / 100);
		// particles[i].sprite.x = window.innerWidth / 2;
		// particles[i].sprite.y = window.innerHeight / 2;
		// particles[i].sprite.x = Math.random() * window.innerWidth;
		// particles[i].sprite.y = Math.random() * window.innerHeight;
		// app.stage.addChild(particles[i].sprite);

		particles[i].particle = new PIXI.Particle(returnTexture(app));
		particles[i].particle.anchorX = 0.5;
		particles[i].particle.anchorY = 0.5;
		particles[i].particle.scaleX = parseInt(parameters.particleSize, 10) / 100;
		particles[i].particle.scaleY = parseInt(parameters.particleSize, 10) / 100;
		particles[i].particle.tint = colors[i % colors.length];
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
	// move particle in a circle with a wobble
	const xyCoeff = parameters.xyCoeff;
	const attractionForce = parameters.attractionForce;

	particles3d.forEach(particle => {

		particle.particle.scaleX = parseInt(parameters.particleSize, 10) / 100;
		particle.particle.scaleY = parseInt(parameters.particleSize, 10) / 100;

		// console.log(particle.particle);

		// particle.particle.scaleX = .5;
		// particle.particle.scaleY = .5;

		const noise = particle.noise(
			particle.particle.x * parameters.xCoeff,
			particle.particle.y * parameters.yCoeff,
			phase * parameters.zCoeff * 1000
		);

		const velX = Math.cos(noise * Math.PI * 2) * parameters.orbit;
		const velY = Math.sin(noise * Math.PI * 2) * parameters.orbit;

		const attractionX = (midX - particle.particle.x) * (1 - parameters.velocity);
		const attractionY = (midY - particle.particle.y) * (1 - parameters.velocity);

		particle.particle.x += velX + attractionX * attractionForce;
		particle.particle.y += velY + attractionY * attractionForce;
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