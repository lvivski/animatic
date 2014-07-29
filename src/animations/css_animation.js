/**
 * Creates new animation
 * @param {Item} item Object to animate
 * @param {Object || string} animation
 * @param {number} duration
 * @param {string} ease Timing function
 * @param {number} delay
 * @param {boolean} generated
 * @constructor
 */
function CssAnimation(item, animation, duration, ease, delay, generated) {
	this.item = item

	this.name = animation.name || animation

	this.start = null
	this.diff = null

	this.duration = (animation.duration || duration) | 0
	this.delay = (animation.delay || delay) | 0
	this.ease = easings.css[animation.ease] || easings.css[ease] || easings.css.linear

	this._infinite = false
	this._generated = generated
}

/**
 * Starts animation timer
 * @param {number} tick Timestamp
 * @param {boolean=} force Force initialization
 */
CssAnimation.prototype.init = function (tick, force) {
	if (this.start !== null && !force) return
	this.start = tick + this.delay

	this.item.style(animationProperty,
		this.name + ' ' + this.duration + 'ms' + ' ' + this.ease + ' ' +
		this.delay + 'ms' + (this._infinite ? ' infinite' : '') + ' ' + 'forwards')
}

/**
 * Runs one tick of animation
 */
CssAnimation.prototype.run = function () {
}

/**
 * Pauses animation
 */
CssAnimation.prototype.pause = function () {
	this.item.style(animationProperty + '-play-state', 'paused')
	this.diff = performance.now() - this.start
}

/**
 * Resumes animation
 */
CssAnimation.prototype.resume = function () {
	this.item.style(animationProperty + '-play-state', 'running')
	this.start = performance.now() - this.diff
}

/**
 * Ends animation
 */
CssAnimation.prototype.end = function () {
	if (this._generated) {
		var computed = getComputedStyle(this.item.dom, null),
		    transform = computed[transformProperty],
		    opacity = computed.opacity

		this.item.style(animationProperty, '')
		this.item.state = Matrix.decompose(Matrix.parse(transform))
		this.item.state.opacity = Number(opacity)
		this.item.style()
	}

	this.start = null
}
