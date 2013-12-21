/**
 * Creates new world and start frame loop
 * @constructor
 */
function World() {
	EventEmitter.call(this)
	this.items = []
	this.frame = null
	this.init()
}

World.prototype = Object.create(EventEmitter.prototype)
World.prototype.constructor = World

/**
 * Starts new frame loop
 */
World.prototype.init = function () {
	var self = this

	this.frame = requestAnimationFrame(update)

	function update(tick) {
		if (fixTick) {
			tick = performance.now()
		}
		self.update(tick)
		self.frame = requestAnimationFrame(update)
	}
}

/**
 * Update the World on frame
 * @param {number} tick
 */
World.prototype.update = function (tick) {
	for (var i = 0; i < this.items.length; ++i) {
		this.items[i].update(tick)
	}
}

/**
 * Adds node to the animated world
 * @param {HTMLElement} node
 * @param {number=} mass
 * @param {number=} viscosity
 * @return {Item}
 */
World.prototype.add = function (node, mass, viscosity, edge) {
	var item
	if (mass) {
		item = new Particle(node, mass, viscosity, edge)
	} else {
		item = new Item(node)
	}
	this.items.push(item)
	return item
}

/**
 * Cancels next frame
 */
World.prototype.cancel = function () {
	this.frame && cancelAnimationFrame(this.frame)
	this.frame = 0
}

/**
 * Stops the World
 */
World.prototype.stop = function () {
	this.cancel()
	for (var i = 0; i < this.items.length; ++i) {
		this.items[i].stop()
	}
}

/**
 * Pauses all animations
 */
World.prototype.pause = function () {
	this.cancel()
	for (var i = 0; i < this.items.length; ++i) {
		this.items[i].pause()
	}
}

/**
 * Resumes all animations
 */
World.prototype.resume = function () {
	for (var i = 0; i < this.items.length; ++i) {
		this.items[i].resume()
	}
	this.init()
}
