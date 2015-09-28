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

	this.transformation = transform

	this.start = null
	this.diff = null

	this.duration = (transform.duration || duration) | 0
	this.delay = (transform.delay || delay) | 0
	ease = transform.ease || ease
	this.ease = easings[ease] || easings.linear
	this.easeName = transform.ease || ease || 'linear'
}

Animation.skip = {duration: null, delay: null, ease: null};

Animation.getState = function (transform, item) {
	var computed = getComputedStyle(item.dom, null),
		initial = {}

	for (var property in transform) {
		if (property in Animation.skip) continue
		if (transform.hasOwnProperty(property)) {
			if (item.state[property] == null) {
				item.state[property] = computed[property]
			}
			initial[property] = new Tween(item.state[property], transform[property], property)
		}
	}
	return initial
}

/**
 * Starts animation timer
 * @param {number} tick Timestamp
 * @param {boolean=} seek Is used in seek mode
 */
Animation.prototype.init = function (tick, seek) {
	if (this.start !== null && !seek) return
	if (this.start === null) {
		this.state = Animation.getState(this.transformation, this.item)
	}
	this.start = tick + this.delay
}

/**
 * Runs one tick of animation
 * @param {number} tick
 * @param {boolean} seek Is used in seek mode
 */
Animation.prototype.run = function (tick, seek) {
	if (tick < this.start && !seek) return
	var percent = 0

	if (tick >= this.start) {
		percent = (tick - this.start) / this.duration
		percent = this.ease(percent)
	}

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
 * Transforms item
 * @param {number} percent
 */
Animation.prototype.transform = function (percent) {
	for (var property in this.state) {
		this.item.state[property] = this.state[property].interpolate(this.item.state[property], percent)
	}
}

/**
 * Ends animation
 * @param {boolean} abort
 * @param {boolean} seek Is used in seek mode
 */
Animation.prototype.end = function (abort, seek) {
	!abort && this.transform(this.ease(1))
	!seek && (this.start = null)
}
