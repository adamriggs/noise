/**
 * This code is for the Intech EN16 MIDI controller
 * It has 16 knobs that are also clickable
 * 
 * This code is currently set up to be used by my parameters.js file that implements lil-gui
 * Each spot in the knobs array is intended to be filled by a Param object from that file
 * 
 * The MIDI data comes through as follows:
 * 
 * note: which knob it is - between 32 and 47
 * velocity: a value between 0 and 127 
 * command: which function the button is being used for
 * - a value of 176 indicates that the knob is being turned
 * - a value of 144 indicates pressing or releaseing
 * - when pressing and releasing the velocity will be 127 for press and 0 for release
 * - the velocity value returns to where it was before the press/release
 * 
 */
import { parametersObjects } from "./parameters";
export const knobs = [];

const onMIDISuccess = (midiAccess) => {
	for (const input of midiAccess.inputs.values()) {
		input.onmidimessage = getMIDIMessage;
	}

	parametersObjects.forEach((param, i) => {
		knobs[i] = param;
	});
}

const getMIDIMessage = (message) => {
	const command = message.data[0];
	const note = message.data[1];
	const velocity = (message.data.length > 2) ? message.data[2] : 0;
	handleKnob(command, note, velocity);
}

const handleKnob = (command, note, velocity) => {
	const knobNumber = Math.floor(mapRange(note, 32, 47, 0, 15));
	const knob = knobs[knobNumber];
	if (knob !== undefined) {
		const value = mapRange(velocity, 0, 127, knob.controller._min, knob.controller._max);

		if (command === 176) { knob.onChange(value); }

		if (command === 144) {	// click
			if (value === 127) {
				// knob click press
			}

			if (value === 0) {
				// knob click release
			}
		}
	}
}
 
const mapRange = (value, inMin, inMax, outMin, outMax) => {
	return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

window.addEventListener('load', () => {
	navigator.requestMIDIAccess().then(onMIDISuccess);
});
