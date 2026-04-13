import { createNoise3D } from 'simplex-noise';
import Stats from 'stats.js';
import { parameters } from './parameters';

// get html stuff
const canvas = document.body.querySelector("#content canvas");
const ctx = canvas.getContext("2d");

// measurements
const PI2 = Math.PI * 2;
const w = window.innerWidth;
const h = window.innerHeight;

// parameters
const midX = w * 0.5;
const midY = h * 0.5;
const distanceMax = 150;
const phaseVariance = 0.01;

// particles
const particles = new Array(20).fill(0).map(() => ({
	// array fill to have a value in it
	// map to put the following in it
	noise: createNoise3D(),
	x: midX + (-100 + Math.random() * 200),	// random x and y coordinates around the center points
	y: midY + (-100 + Math.random() * 200),
}));

// set canvas up
canvas.width = w;
canvas.height = h;

let rafId = null;	// id that request animation frame returns
let phase = 0;	// hmm... 

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const drawFly = (particle, ctx, tick) => {	// this function signature has 3 parameters but in the loop it's called with 4
	// console.log(particle, ctx, tick);
	// console.log(tick);
	// console.log('*****');
	// these are forces
	const velocityForce = 1;
	const attractionForce = 0.009;

	// return a single value based on three values
	const noiseVal = particle.noise(
		particle.x * phaseVariance,	// what is the .01 used for here and in other code examples
		particle.y * phaseVariance,
		tick	// and here is the tick being used as input for noise
	);

	// velocityForce is the magnitude and from that we get the next 
	// coordinates for the fly where noiseVal is the angle
	// I believe PI2 is involved for a degrees and radians conversion
	let velocityX = Math.cos(noiseVal * PI2) * velocityForce;
	let velocityY = Math.sin(noiseVal * PI2) * velocityForce;

	// this is a percentage times a distance for the purpose
	// of making the orbit wobble
	const attractionX = (midX - particle.x) * attractionForce;
	const attractionY = (midY - particle.y) * attractionForce;

	// x and y values are incremented with the 
	// path distance and the wobble distance
	particle.x += velocityX + attractionX;
	particle.y += velocityY + attractionY;

	// calculate the disance to the center point
	const distanceToMid = Math.sqrt(
		(particle.x - midX) ** 2 + (particle.y - midY) ** 2
	);

	// percentage of distance to the center which then becomes the alpha
	const distancePercent = 1 - distanceToMid / distanceMax;
	const alpha = Math.abs(distancePercent);

	// draw stuff
	ctx.beginPath();
	ctx.shadowBlur = 8;
	ctx.shadowColor = "rgba(255, 255, 150, 0.8)";
	ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;

	ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
};

let prevTime = 0;
const loop = (timestamp) => {
	stats.begin();
	// errase the canvas
	ctx.clearRect(0, 0, w, h);

	if (!prevTime) {
		prevTime = timestamp;
	}
	const deltaTime = timestamp - prevTime;
	prevTime = timestamp;

	// update all particles
	particles.forEach((particle) => {
		drawFly(particle, ctx, phase);
	});

	// increase the myserious phase
	// ehich might be the tick value in other code examples or in the drawFly function
	// what is the purpose of this?
	// the noiseval function in drawFly uses the same value so I've made it a variable since they are probably linked
	phase += phaseVariance;

	stats.end();
	rafId = requestAnimationFrame(loop);
};

// canvas.addEventListener("click", () => {
// 	if (rafId) {
// 		cancelAnimationFrame(rafId);
// 		rafId = null;
// 	} else {
// 		loop();
// 	}
// });

loop();

