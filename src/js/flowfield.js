import { createNoise3D } from 'simplex-noise';

const map = (value, inMin, inMax, outMin, outMax) =>
	(value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

const canvas = document.body.querySelector('#content canvas');
const ctx = canvas.getContext('2d');

const w = window.innerWidth;
const h = window.innerHeight;
const midX = w * 0.5;
const midY = h * 0.5;

const maxDistance = 200;

const noise = createNoise3D();

canvas.width = w;
canvas.height = h;

let rafId = null;
let phase = 0;
let colorPhase = 0;


const generate = () => {
	const numParticles = 1;

	return new Array(numParticles).fill().map(() => ({
		x: Math.random() * w,
		y: Math.random() * h,
		velocity: 1 + Math.random(),
		opacity: 1,
		angle: 0,
		distance: 0,
	}));
}

let particles = generate();

const update = (particle, phase) => {
	const scale = 0.003;

	// this seems like the same kind of thing as the orbiting examples but 
	// without orbiting a center point but instead with screen wrapping
	const noiseValue = noise(particle.x * scale, particle.y * scale, phase);

	const angle = noiseValue * Math.PI * 2;

	particle.x += Math.cos(angle) * particle.velocity;
	particle.y += Math.sin(angle) * particle.velocity;

	const distance = Math.hypot(midX - particle.x, midY - particle.y);
	particle.distancePercentage = Math.min(distance / maxDistance, 1);

	particle.angle = angle;

	if (particle.x > w) {
		particle.x = 0;
	}

	if (particle.x < 0) {
		particle.x = w;
	}

	if (particle.y > h) {
		particle.y = 0;
	}

	if (particle.y < 0) {
		particle.y = h;
	}
}

const draw = (particle, phase, colorPhase) => {
	const colorAngle = Math.cos(colorPhase + (particle.angle * 0.5));
	const colorAngleMapped = map(colorAngle, -1, 1, 0, 1);


	const hue = 180 + (100 * colorAngleMapped);
	const lightness = 50 - (10 * (particle.distancePercentage));
	const saturation = 50 - (20 * (particle.distancePercentage));
	const thickness = 10;
	const opacity = 20;	// 4

	ctx.beginPath();
	ctx.fillStyle = `hsla(${hue} ${saturation}% ${lightness}% / ${opacity}%)`;
	ctx.arc(particle.x, particle.y, thickness, 0, Math.PI * 2);
	ctx.fill();
	ctx.closePath();
}


const loop = () => {
	particles.forEach((particle) => {
		update(particle, phase);
		draw(particle, phase, colorPhase);
	});


	phase += 0.0009;
	colorPhase += 0.002;

	rafId = requestAnimationFrame(loop);
}

loop();

canvas.addEventListener('click', () => {
	ctx.clearRect(0, 0, w, h);

	particles = generate();
});