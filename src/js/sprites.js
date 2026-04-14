import * as PIXI from 'pixi.js';
import { maxParticleSize } from './parameters';

// const colors = ['#DBBEAB', '#789A9C', '#ABDADB', '#866D5C', '#305A5C', '#331F12'];
export const colors = ['#A4D2D3', '#8AB0B1', '#ABDADB', '#6F8E8F', '#556C6D', '#3A4B4B'];

export const returnTexture = (app) => {
	const gfx = new PIXI.Graphics();
	gfx.circle(0, 0, maxParticleSize / 2);
	gfx.fill({ color: '#ffffff', alpha: 1 });
	// gfx.stroke({
	// 	alpha: 1,
	// 	color: '#000000',
	// 	width: 1
	// });
	gfx.cacheAsTexture = true;

	const texture = app.renderer.generateTexture(gfx, {
		scaleMode: 'linear',
		resolution: 2
	});

	return texture;
}

export const returnSprite = (app, count) => {
	let colorNumber = count % colors.length;
	if (count) {
		colorNumber = count;
		colorCounter++;
	}

	const gfx = new PIXI.Graphics();
	gfx.circle(0, 0, defaultParameters.particleSize / 2);
	gfx.fill({ color: colors[colorCounter % colors.length], alpha: 1 });
	gfx.cacheAsTexture = true;

	const texture = app.renderer.generateTexture(gfx, {
		scaleMode: 'linear',
		resolution: 2
	});

	return new PIXI.Sprite(texture);
}