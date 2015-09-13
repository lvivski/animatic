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

Animation.getState = function (transform, item) {
	var initial = {},
	    computed = getComputedStyle(item.dom, null),
	    skip = {duration:null, delay:null, ease:null}

	for (var property in transform) {
		if (property in skip) continue
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
 * @param {boolean=} force Force initialization
 */
Animation.prototype.init = function (tick, force) {
	if (this.start !== null && !force) return
	this.start = tick + this.delay

	this.state = Animation.getState(this.transformation, this.item)
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
 */
Animation.prototype.end = function (abort) {
	!abort && this.transform(this.ease(1))
	this.start = null
}
