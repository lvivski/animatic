/**
 * Creatites particle with physics
 * @param {HTMLElement} node
 * @param {number=} mass
 * @param {number=} viscosity
 * @constructor
 */
function Particle(node, mass, viscosity, edge) {
	Item.call(this, node)

	if (mass === Object(mass)) {
		viscosity = mass.viscosity
		edge = mass.edge
		mass = mass.mass
	}

	mass /= 100

	mass || (mass = 0.01)
	viscosity || (viscosity = 0.1)
	edge || (edge = false)

	this.mass = 1 / mass
	this.viscosity = viscosity
	this.edge = edge
}

Particle.prototype = Object.create(Item.prototype)
Particle.prototype.constructor = Particle

/**
 * Initializes particle
 */
Particle.prototype.init = function () {
	Item.prototype.init.call(this)

	this.current = {
		position: Vector.zero(),
		velocity: Vector.zero(),
		acceleration: Vector.zero()
	}

	this.previous = {
		position: Vector.zero(),
		velocity: Vector.zero(),
		acceleration: Vector.zero()
	}

	this.clock = null
}

/**
 * Updates particle and applies integration
 * @param {number} tick
 */
Particle.prototype.update = function (tick) {
	this.animation.run(tick)

	this.integrate(tick)

	this.style()
}

Particle.prototype.timeline = function (tick) {
	this.clear()
	this.animation.seek(tick)

	this.integrate(tick, true)

	this.style()
}

/**
 * Integrates particle
 * @param {number} delta
 */
Particle.prototype.integrate = function (tick, clamp) {
	this.clock || (this.clock = tick)

	var delta = tick - this.clock

	if (delta) {
		clamp && (delta = Math.max(-16, Math.min(16, delta)))

		this.clock = tick

		delta *= 0.001

		Constant.call(this)
		this.edge && Edge.call(this, Vector.set(this.edge.min), Vector.set(this.edge.max), this.edge.bounce)

		Verlet.call(this, delta, 1.0 - this.viscosity)
	}
}

Particle.prototype.css = function () {
	throw new Error('CSS is nor supported for physics');
}

/**
 * Gets particle matrix
 * @returns {Array}
 */
Particle.prototype.matrix = function () {
	var state = this.state
	return Matrix.compose(
		this.current.position, state.rotate, state.scale
	)
}
