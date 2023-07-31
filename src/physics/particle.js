import { Item } from '../item.js'
import { Constant } from './forces/constant.js'
import { Edge } from './forces/edge.js'
import { Verlet } from './verlet.js'
import { Matrix } from '../math/matrix.js'
import { Vector } from '../math/vector.js'

export class Particle extends Item {

  /**
   * Creates particle with physics
   * @param {HTMLElement} node
   * @param {number | {mass:number, viscosity:number, edge: {min: number, max: number, bounce: boolean}}} mass
   * @param {number} viscosity
   * @param {null | {min: number, max: number, bounce: boolean}} edge
   * @constructor
   */
  constructor(node, mass, viscosity, edge) {
    super(node)

    if (typeof mass === 'object') {
      viscosity = mass.viscosity
      edge = mass.edge
      mass = mass.mass
    } else {
      mass /= 100
    }

    mass ||= 0.01
    viscosity ||= 0.1
    edge ||= null

    this.mass = 1 / mass
    this.viscosity = viscosity
    this.edge = edge

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
  update(tick) {
    this.animation.run(tick)

    this.integrate(tick)

    this.style()
  }

  timeline(tick) {
    this.clear()
    this.animation.seek(tick)

    this.integrate(tick, true)

    this.style()
  }

  /**
   * Integrates particle
   * @param {number} tick
   * @param {boolean=} clamp
   */
  integrate(tick, clamp) {
    this.clock ||= tick

    let delta = tick - this.clock

    if (delta) {
      clamp && (delta = Math.max(-16, Math.min(16, delta)))

      this.clock = tick

      delta *= 0.001

      Constant.call(null, this)
      this.edge && Edge.call(null, this, Vector.set(this.edge.min), Vector.set(this.edge.max), this.edge.bounce)

      Verlet.call(null, this, delta, 1.0 - this.viscosity)
    }
  }

  css() {
    throw new Error('CSS is nor supported for physics');
  }

  /**
   * Gets particle matrix
   * @returns {Array}
   */
  matrix() {
    const state = this.state
    return Matrix.compose(
      this.current.position, state.rotate, state.scale
    )
  }
}
