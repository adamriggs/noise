import GUI from 'lil-gui';
import { knobs } from './EN16';

export const maxParticleSize = 100;

export let parameters = {
	particleSize: 5,
	orbit: 4,
	repulsion: 0.04,
	attraction: 0.01,
	pointerForce: 6,
	pointerDistance: 100,
	xCoeff: 0.001,
	yCoeff: 0.002,
	zCoeff: 0.003,
	paramsInUrl: true,
};

// this should be exportable instead of importing the knobs array
// that way if the EN16.js file is missing there won't be an error
export const parametersObjects = [];

const url = new URL(window.location.href);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const gui = new GUI();
document.body.appendChild(gui.domElement);

class Param {
	constructor(name) {
		this.name = name;
		this.value;
		this.controller;
		this.update;
	}

	onChange(value) {
		value = this.update(value);
		this.value = value;
		parameters[this.name] = value;
		this.setURLParameter();
		this.controller.updateDisplay();
	}

	setURLParameter() {
		url.searchParams.set(this.name, this.value);
		if (parameters.paramsInUrl === true) {
			window.history.pushState({}, '', url.toString());
		}
	}
};

const particleSizeParam = new Param('particleSize');
particleSizeParam.update = (value) => {
	value = Math.round(value);
	parameters.particleSize = value;
	return value;
};
particleSizeParam.controller = gui.add(parameters, 'particleSize', 1, 100).onChange(value => particleSizeParam.onChange(value));
parametersObjects.push(particleSizeParam);

const noise3d = gui.addFolder('3dNoise');

const orbitParam = new Param('orbit');
orbitParam.update = (value) => {
	value = Math.round(value);
	parameters.orbit = value;
	return value;
};
orbitParam.controller = noise3d.add(parameters, 'orbit', 1, 50).onChange(value => orbitParam.onChange(value));
parametersObjects.push(orbitParam);

const repulsionParam = new Param('repulsion');
repulsionParam.update = (value) => {
	parameters.repulsion = value;
	return value;
};
repulsionParam.controller = noise3d.add(parameters, 'repulsion', .0001, 0.9).onChange(value => repulsionParam.onChange(value));
parametersObjects.push(repulsionParam);

const attractionParam = new Param('attraction');
attractionParam.update = (value) => {
	parameters.attraction = value;
	return value;
};
attractionParam.controller = noise3d.add(parameters, 'attraction', .0001, 0.1).onChange(value => attractionParam.onChange(value));
parametersObjects.push(attractionParam);

const pointerForceParam = new Param('pointerForce');
pointerForceParam.update = (value) => {
	parameters.pointerForce = value;
	return value;
};
pointerForceParam.controller = noise3d.add(parameters, 'pointerForce', 0, 25).onChange(value => pointerForceParam.onChange(value));
parametersObjects.push(pointerForceParam);

const pointerDistanceParam = new Param('pointerDistance');
pointerDistanceParam.update = (value) => {
	parameters.pointerDistance = value;
	return value;
};
pointerDistanceParam.controller = noise3d.add(parameters, 'pointerDistance', 25, 500).onChange(value => pointerDistanceParam.onChange(value));
parametersObjects.push(pointerDistanceParam);

const xCoeffParam = new Param('xCoeff');
xCoeffParam.update = (value) => {
	parameters.xCoeff = value;
	return value;
};
xCoeffParam.controller = noise3d.add(parameters, 'xCoeff', .000001, 0.01).onChange(value => xCoeffParam.onChange(value));
parametersObjects.push(xCoeffParam);

const yCoeffParam = new Param('yCoeff');
yCoeffParam.update = (value) => {
	parameters.yCoeff = value;
	return value;
};
yCoeffParam.controller = noise3d.add(parameters, 'yCoeff', .000001, 0.01).onChange(value => yCoeffParam.onChange(value));
parametersObjects.push(yCoeffParam);

const zCoeffParam = new Param('zCoeff');
zCoeffParam.update = (value) => {
	parameters.zCoeff = value;
	return value;
};
zCoeffParam.controller = noise3d.add(parameters, 'zCoeff', .000001, 0.01).onChange(value => zCoeffParam.onChange(value));
parametersObjects.push(zCoeffParam);

/**
 * presets
 */

const presets = gui.addFolder('Presets');

const presetFunctions = {
	cartoon_wind: () => {
		parameters.particleSize = 5;
		parameters.orbit = 20;
		parameters.repulsion = 0.0001
		parameters.attraction = 0.016618897637795275;
		parameters.pointerForce = 25;
		parameters.pointerDistance = 300;
		parameters.xCoeff = 0.00047339370078740165;
		parameters.yCoeff = 0.0018905748031496064;
		parameters.zCoeff = 0.0008670551181102363;
		setAllParameters();
	},
	swarm: () => {
		parameters.particleSize = 10;
		parameters.orbit = 16;
		parameters.repulsion = 0.1630740157480315;
		parameters.attraction = 0.01583228346456693;
		parameters.pointerForce = 25;
		parameters.pointerDistance = 200;
		parameters.xCoeff = 0.01;
		parameters.yCoeff = 0.01;
		parameters.zCoeff = 0.01;
		setAllParameters();
	},
	speedy_ball: () => {
		parameters.particleSize = 10;
		parameters.orbit = 40;
		parameters.repulsion = 0.0001;
		parameters.attraction = 0.1;
		parameters.pointerForce = 15;
		parameters.pointerDistance = 300;
		parameters.xCoeff = 0.00047339370078740165;
		parameters.yCoeff = 0.0011819842519685039;
		parameters.zCoeff = 0.0011819842519685039;
		setAllParameters();
	},
	lazy_bones: () => {
		parameters.particleSize = 15;
		parameters.orbit = 1;
		parameters.repulsion = 0.0001
		parameters.attraction = 0.0001;
		parameters.pointerForce = 3;
		parameters.pointerDistance = 300;
		setAllParameters();
	},
	eclipse: () => {
		parameters.particleSize = 5;
		parameters.orbit = 4;
		parameters.repulsion = 0.04;
		parameters.attraction = 0.01;
		parameters.pointerForce = 3;
		parameters.pointerDistance = 100;
		parameters.xCoeff = 0.0001;
		parameters.yCoeff = 0.0001;
		parameters.zCoeff = 0.0001;
		setAllParameters();
	},
	reset: () => {
		parameters.particleSize= 5;
		parameters.orbit= 4;
		parameters.repulsion= 0.04;
		parameters.attraction = 0.01;
		parameters.pointerForce = 6;
		parameters.xCoeff= 0.001;
		parameters.yCoeff= 0.002;
		parameters.zCoeff= 0.003;
		parameters.paramsInUrl= true;

		setAllParameters();
	}
}

presets.add(presetFunctions, 'cartoon_wind');
presets.add(presetFunctions, 'swarm');
presets.add(presetFunctions, 'speedy_ball');
presets.add(presetFunctions, 'lazy_bones');
presets.add(presetFunctions, 'eclipse');
presets.add(presetFunctions, 'reset');

/**
 * url buttons
 */

const sharing = gui.addFolder('Sharing');

const paramsInUrlParam = new Param('paramsInUrl');
paramsInUrlParam.update = (value) => {
	parameters.paramsInUrl = value;
	const cleanUrl = window.location.origin + window.location.pathname;
	window.history.replaceState({}, document.title, cleanUrl);
	return value;
};
paramsInUrlParam.controller = sharing.add(parameters, 'paramsInUrl').onChange(value => paramsInUrlParam.onChange(value));
parametersObjects.push(paramsInUrlParam);

const setURL = {
	copyURLToClipboard: () => {
		navigator.clipboard.writeText(url);

	}
}

sharing.add(setURL, 'copyURLToClipboard');

/**
 * 
 * Main Functions
 * 
 */

export const initParameters = () => {
	parameters.paramsInUrl = urlParams.get('paramsInUrl') !== null ? returnBinary(urlParams.get('paramsInUrl')) : parameters.paramsInUrl;
	parameters.particleSize = urlParams.get('particleSize') !== null ? urlParams.get('particleSize') : parameters.particleSize;
	parameters.orbit = urlParams.get('orbit') !== null ? urlParams.get('orbit') : parameters.orbit;
	parameters.repulsion = urlParams.get('repulsion') !== null ? urlParams.get('repulsion') : parameters.repulsion;
	parameters.attraction = urlParams.get('attraction') !== null ? urlParams.get('attraction') : parameters.attraction;
	parameters.pointerForce = urlParams.get('pointerForce') !== null ? urlParams.get('pointerForce') : parameters.pointerForce;
	parameters.pointerDistance = urlParams.get('pointerDistance') !== null ? urlParams.get('pointerDistance') : parameters.pointerDistance;
	
	parameters.xCoeff = urlParams.get('xCoeff') !== null ? urlParams.get('xCoeff') : parameters.xCoeff;
	parameters.yCoeff = urlParams.get('yCoeff') !== null ? urlParams.get('yCoeff') : parameters.yCoeff;
	parameters.zCoeff = urlParams.get('zCoeff') !== null ? urlParams.get('zCoeff') : parameters.zCoeff;

	setAllParameters();
}

const setAllParameters = () => {
	parametersObjects.forEach(pObj => {
		pObj.onChange(parameters[pObj.name]);
	});
}

const returnBinary = (value) => {
	if (value === '1' || value === true || value === 'true' || value === 'TRUE') {
		return true;
	} else {
		return false;
	}
}
