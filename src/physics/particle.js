import { Item } from "../item.js"
import { Constant } from "./forces/constant.js"
import { Edge } from "./forces/edge.js"
import { Verlet } from "./verlet.js"
import { Matrix } from "../math/matrix.js"
import { Vector } from "../math/vector.js"

/** @typedef {import("../item.js").ItemStateValue} PhysicsStateValue */
/** @typedef {import("../item.js").ItemState & {translate: Array<number>}} PhysicsState */
/** @typedef {{position: Array<number>, velocity: Array<number>, acceleration: Array<number>}} PhysicsKinematics */
/** @typedef {{min?: number|Array<number>, max?: number|Array<number>, bounce?: boolean}|null} PhysicsEdge */
/** @typedef {{mass: number, viscosity: number, edge: PhysicsEdge, state: PhysicsState, current: PhysicsKinematics, previous: PhysicsKinematics}} PhysicsBody */
/** @typedef {{mass?: number, viscosity?: number, edge?: NonNullable<PhysicsEdge>, physics?: string}} ParticleOptions */

export class Particle extends Item {
  /**
   * Creates particle with physics
   * @param {HTMLElement} node
  * @param {number | ParticleOptions} mass
  * @param {number=} viscosity
  * @param {PhysicsEdge=} edge
   * @constructor
   */
  constructor(node, mass, viscosity, edge) {
    super(node)
    let physicsMode
    let particleMass

    if (typeof mass === "object") {
      physicsMode = mass.physics
      viscosity = mass.viscosity || viscosity
      edge = mass.edge || edge
      particleMass = mass.mass
    } else {
      particleMass = mass / 100
    }

    particleMass ||= 0.01
    viscosity ||= 0.1
    edge ||= null

    /** @type {number} */
    this.mass = 1 / particleMass
    /** @type {number} */
    this.viscosity = viscosity
    /** @type {PhysicsEdge} */
    this.edge = edge

    /** @type {PhysicsKinematics} */
    this.current = {
      position: Vector.zero(),
      velocity: Vector.zero(),
      acceleration: Vector.zero()
    }

    /** @type {PhysicsKinematics} */
    this.previous = {
      position: Vector.zero(),
      velocity: Vector.zero(),
      acceleration: Vector.zero()
    }

    this.clock = null
    this.physicsMode = physicsMode || "auto"
    this.nativeAnimations = this.physicsMode !== "live"
  }

  /**
   * Updates particle and applies integration
   * @param {number} tick
   */
  update(tick) {
    if (this.animation.native.handlesPlayback()) return
    this.animation.run(tick)
    if (this.animation.native.handlesPlayback()) return

    this.integrate(tick)

    this.style()
  }

  /**
   * Updates particle on timeline
   * @param {number} tick
   */
  timeline(tick) {
    if (this.animation.native.seek(tick)) return
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
    this.clock ??= tick

    let delta = tick - this.clock

    if (delta) {
      if (clamp) {
        delta = Math.max(-16, Math.min(16, delta))
      }

      this.clock = tick

      delta *= 0.001

      const body = /** @type {PhysicsBody} */ (/** @type {unknown} */ (this))

      Constant.call(null, body)
      if (this.edge) {
        Edge.call(
          null,
          body,
          Vector.set(this.edge.min),
          Vector.set(this.edge.max),
          this.edge.bounce
        )
      }

      Verlet.call(null, body, delta, 1.0 - this.viscosity)

      if (this.edge) {
        Edge.call(
          null,
          body,
          Vector.set(this.edge.min),
          Vector.set(this.edge.max),
          this.edge.bounce
        )
      }
    }
  }

  /**
   * @return {ReturnType<Item['css']>}
   */
  css() {
    throw new Error("CSS is nor supported for physics")
  }

  /**
   * Gets particle matrix
   * @returns {number[]}
   */
  matrix() {
    const state = /** @type {{ rotate: number[], scale: number[] }} */ (this.state)
    return Matrix.compose(this.current.position, state.rotate, state.scale)
  }
}
