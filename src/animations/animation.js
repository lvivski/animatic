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

Animation.skip = {duration: null, delay: null, ease: null}
Animation.transform = {translate: null, rotate: null, scale: null}

Animation.getState = function (transform, item) {
	var initial = {},
		computed
		
	for (var property in transform) {
		if (property in Animation.skip) continue
		if (transform.hasOwnProperty(property)) {
			if (item.get(property) == null) {
				if (!computed) {
					computed = getComputedStyle(item.dom, null)
				}
				Animation.setItemState(item, property, computed)
			}
			initial[property] = new Tween(item.get(property), transform[property], property)
		}
	}
	return initial
}

Animation.setItemState = function (item, property, computed) {
	if (property in Animation.transform) {
		var value = computed[transformProperty]
		if (value === 'none') {
			value = {
				translate: Vector.zero(),
				rotate: Vector.zero(),
				scale: Vector.set(1)
			}
		} else {
			value = Matrix.decompose(Matrix.parse(value))
		}
		item.set('translate', value.translate)
		item.set('rotate', value.rotate)
		item.set('scale', value.scale)
	} else {
		item.set(property, computed[property])
	}
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
 * Merges animation values
 * @param {Object} transform
 * @param {number} duration
 * @param {string} ease Timing function
 * @param {number} delay
 */
Animation.prototype.merge = function (transform, duration, ease, delay) {
	this.duration = (transform.duration || duration) | 0
	this.delay = (transform.delay || delay) | 0
	ease = transform.ease || ease
	this.ease = easings[ease] || easings.linear
	this.easeName = transform.ease || ease || 'linear'

	merge(this.transformation, transform)

	this.start = null
}

/**
 * Gets values from state params
 * @param {string} type
 */
Animation.prototype.get = function (type) {
	return this.state[type]
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

Animation.prototype.interpolate = function (property, percent) {
	return this.get(property).interpolate(percent)
}

/**
 * Transforms item
 * @param {number} percent
 */
Animation.prototype.transform = function (percent) {
	for (var property in this.state) {
		this.item.set(property, this.interpolate(property, percent))
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
