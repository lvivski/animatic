/**
 * Creates new animated item
 * @param {HTMLElement} node
 * @constructor
 */
function Item(node) {
	EventEmitter.call(this)

	this.dom = node

	this.animation = new Sequence(this)

	this.running = true
	this.state = {}
}

Item.prototype = Object.create(EventEmitter.prototype)
Item.prototype.constructor = Item

/**
 * Updates item on frame
 * @param {number} tick
 */
Item.prototype.update = function (tick) {
	if (!this.running) return
	this.animation.run(tick)
}

/**
 * Updates item on timeline
 * @param {number} tick
 */
Item.prototype.timeline = function (tick) {
	this.clear()
	this.animation.seek(tick)
}

/**
 * Pauses item animation
 */
Item.prototype.pause = function () {
	if (!this.running) return
	this.animation.pause()
	this.running = false
}

/**
 * Resumes item animation
 */
Item.prototype.resume = function () {
	if (this.running) return
	this.animation.resume()
	this.running = true
}

/**
 * Sets style to the dom node
 * @param {string=} property
 * @param {string=} value
 */
Item.prototype.style = function (property, value) {
	var style = this.dom.style;
	if (property && value) {
		style[property] = value
	} else {
		style[transformProperty] = this.transform()
		for (var property in this.state) {
			style[property] = this.get(property)
		}
	}
}

/**
 * Returns transform CSS value
 * @return {string}
 */
Item.prototype.transform = function () {
	return Matrix.stringify(this.matrix())
}

/**
 * Calculates transformation matrix for the state
 * @return {Object}
 */
Item.prototype.matrix = function () {
	var state = this.state
	return Matrix.compose(
		state.translate, state.rotate, state.scale
	)
}

/**
 * Gets transformation needed to make Item in center
 * @return {Object}
 */
Item.prototype.center = function () {
	return Matrix.decompose(Matrix.inverse(this.matrix()))
}

/**
 * Rotates item to look at vector
 * @param {Array} vector
 */
Item.prototype.lookAt = function (vector) {
	var transform = Matrix.decompose(Matrix.lookAt(
		vector, this.get('translate'), Vector.set(0, 1, 0)
	))
	this.set('rotate', transform.rotate)
}

/**
 * Sets values to state params
 * @param {string} type
 * @param {Array|Number|String} value
 * @return {Item}
 */
Item.prototype.set = function (type, value) {
	if (Array.isArray(value)) {
		this.state[type] || (this.state[type] = [])
		for (var i = 0; i < value.length; ++i) {
			if (value[i] !== undefined) {
				this.state[type][i] = value[i]
			}
		}
	} else {
		this.state[type] = value
	}

	return this
}

/**
 * Gets values from state params
 * @param {string} type
 */
Item.prototype.get = function (type) {
	return this.state[type]
}

/**
 * Clears item transform
 */
Item.prototype.clear = function () {
	this.state.translate = Vector.zero()
	this.state.rotate = Vector.zero()
	this.state.scale = Vector.set(1)
}

/**
 * Adds animation
 * @param {Object|Array} transform
 * @param {number} duration
 * @param {string} ease
 * @param {number} delay
 * @return {Sequence}
 */
Item.prototype.animate = function (transform, duration, ease, delay) {
	return this.animation.add(transform, duration, ease, delay)
}

/**
 * Alternates current animation
 * @param {Object|Array} transform
 * @param {number} duration
 * @param {string} ease
 * @param {number} delay
 */
Item.prototype.alternate = function (transform, duration, ease, delay) {
	if (this.animation.length) {
		this.animation.get(0).merge(transform, duration, ease, delay)
	} else {
		this.animate.call(this, transform, duration, ease, delay)
	}
}

/**
 * Finishes all Item animations
 * @param {boolean} abort
 */
Item.prototype.finish = function (abort) {
	this.animation.end(abort)
	return this
}

/**
 * Stops all Item animations
 */
Item.prototype.stop = function () {
	return this.finish(true)
}

/**
 * Generates CSS animation or transition
 * @param {boolean=} idle
 * @return {CSS}
 */
Item.prototype.css = function (idle) {
	return new CSS(this, idle)
}
