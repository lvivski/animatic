/**
 * Creatites particle with physics
 * @param {HTMLElement} node
 * @param {number=} mass
 * @param {number=} viscosity
 * @constructor
 */
function Particle(node, mass, viscosity) {
  Item.call(this, node)

  if (mass === Object(mass)) {
    viscosity = mass.viscosity
    mass = mass.mass
  }

  mass || (mass = 0.01)
  viscosity || (viscosity = 0.05)

  this.mass = 1 / mass
  this.viscosity = viscosity
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
    
    Verlet.call(this, delta, 1.0 - this.viscosity)
  }
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