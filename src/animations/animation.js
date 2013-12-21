/**
 * Creates new animation
 * @param {Item} item Object to animate
 * @param {Object} transform
 * @param {number} duration
 * @param {string} ease Timing function
 * @param {number} delay
 * @constructor
 */
function Animation(item, transform, duration, ease, delay) {
	this.item = item

	this.translate = transform.translate && transform.translate.map(parseFloat)
	this.rotate = transform.rotate && transform.rotate.map(parseFloat)
	this.scale = transform.scale
	this.opacity = transform.opacity

	this.start = null
	this.diff = null

	this.duration = (transform.duration || duration) | 0
	this.delay = (transform.delay || delay) | 0
	this.ease = easings[transform.ease] || easings[ease] || easings.linear

	this.easeName = ease || 'linear'
}

/**
 * Starts animation timer
 * @param {number} tick Timestamp
 * @param {boolean=} force Force initialization
 */
Animation.prototype.init = function (tick, force) {
	if (this.start !== null && !force) return
	this.start = tick + this.delay

	var state = this.item.state
	this.initial = {
		translate: state.translate.slice(),
		rotate: state.rotate.slice(),
		scale: state.scale.slice(),
		opacity: state.opacity
	}
}

/**
 * Runs one tick of animation
 * @param {number} tick
 */
Animation.prototype.run = function (tick) {
	if (tick < this.start) return

	var percent = (tick - this.start) / this.duration
	percent = this.ease(percent)

	this.transform(percent)
}

/**
 * Pauses animation
 */
Animation.prototype.pause = function () {
	this.diff = performance.now() - this.start
}

/**
 * Resumes animation
 */
Animation.prototype.resume = function () {
	this.start = performance.now() - this.diff
}

/**
 * Sets new item state
 * @param {string} type
 * @param {number} percent
 */
Animation.prototype.set = function (type, percent) {
	var state = this.item.state,
	    initial = this.initial

	if (Array.isArray(this[type])) {
		for (var i = 0; i < 3; ++i) if (this[type][i]) {
			state[type][i] = initial[type][i] + this[type][i] * percent
		}
	} else if (this[type] !== undefined) {
		state[type] = initial[type] + (this[type] - initial[type]) * percent
	}
}

/**
 * Transforms item
 * @param {number} percent
 */
Animation.prototype.transform = function (percent) {
	this.set('translate', percent)
	this.set('rotate', percent)
	this.set('scale', percent)
	this.set('opacity', percent)
}

/**
 * Ends animation
 * @param {boolean} abort
 */
Animation.prototype.end = function (abort) {
	!abort && this.transform(1)
	this.start = null
}
