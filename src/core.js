/**
 * Anima
 * @type {Object}
 */
var a = {}

/**
 * Creates and initializes world with frame loop
 * @return {World}
 */
a.world = function () {
	return new World
}

/**
 * Creates and initializes timeline
 * @return {Timeline}
 */
a.timeline = function () {
	return new Timeline
}

if (typeof module === 'object' && typeof module.exports === 'object') {
	module.exports = a
} else if (typeof define === 'function' && define.amd) {
	define(a)
} else {
	window.anima = window.a = a
}
