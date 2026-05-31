import { easings } from "./easings.js"
import { Vector } from "../math/vector.js"
import { Matrix } from "../math/matrix.js"
import { Tween } from "./tween.js"
import { merge, transformProperty } from "../utils.js"

/** @typedef {Record<string, unknown> & {duration?: number, delay?: number, ease?: string}} AnimationTransform */
/** @typedef {Record<string, Tween>} AnimationTweenState */

export class Animation {
  /**
   * Creates new animation
  * @param {import("../item.js").Item} item Object to animate
  * @param {AnimationTransform} transform
   * @param {number} duration
   * @param {string} ease Timing function
   * @param {number} delay
   * @constructor
   */
  constructor(item, transform, duration, ease, delay) {
    this.item = item

    /** @type {AnimationTransform} */
    this.transformation = transform

    /** @type {number | null} */
    this.start = null
    /** @type {number | null} */
    this.diff = null
    /** @type {AnimationTweenState} */
    this.state = {}

    this.duration = (transform.duration || duration) | 0
    this.delay = (transform.delay || delay) | 0
    ease = transform.ease || ease
    this.ease = easings[ease] || easings.linear
    this.easeName = transform.ease || ease || "linear"
  }

  static skip = { duration: null, delay: null, ease: null }
  static transform = { translate: null, rotate: null, scale: null }

  static getState(transform, item) {
    const initial = {}
    let computed

    for (const property in transform) {
      if (property in Animation.skip) continue
      if (transform.hasOwnProperty(property)) {
        if (item.get(property) == null) {
          if (!computed) {
            computed = getComputedStyle(item.dom, null)
          }
          Animation.setItemState(item, property, computed)
        }
        initial[property] = new Tween(
          item.get(property),
          transform[property],
          property
        )
      }
    }
    return initial
  }

  static setItemState = function (item, property, computed) {
    if (property in Animation.transform) {
      let value = computed[transformProperty]
      if (value === "none") {
        value = {
          translate: Vector.zero(),
          rotate: Vector.zero(),
          scale: Vector.set(1)
        }
      } else {
        value = Matrix.decompose(Matrix.parse(value))
      }
      item.set("translate", value.translate)
      item.set("rotate", value.rotate)
      item.set("scale", value.scale)
    } else {
      item.set(property, computed[property])
    }
  }

  /**
   * Starts animation timer
   * @param {number} tick Timestamp
   * @param {boolean=} seek Is used in seek mode
   */
  init(tick, seek = false) {
    if (this.start !== null && !seek) return
    if (this.start === null) {
      this.state = Animation.getState(this.transformation, this.item)
    }
    this.start = tick + this.delay
  }

  /**
   * Merges animation values
  * @param {AnimationTransform} transform
   * @param {number} duration
   * @param {string} ease Timing function
   * @param {number} delay
   */
  merge(transform, duration, ease, delay) {
    this.duration = (transform.duration || duration) | 0
    this.delay = (transform.delay || delay) | 0
    ease = transform.ease || ease
    this.ease = easings[ease] || easings.linear
    this.easeName = transform.ease || ease || "linear"

    merge(this.transformation, transform)

    this.start = null
  }

  /**
   * Gets values from state params
   * @param {string} type
   */
  get(type) {
    return this.state[type]
  }

  /**
   * Runs one tick of animation
   * @param {number} tick
  * @param {boolean=} seek Is used in seek mode
   */
  run(tick, seek = false) {
    if (this.start === null) return

    const start = this.start

    if (tick < start && !seek) return
    let percent = 0

    if (tick >= start) {
      percent = (tick - start) / this.duration
      percent = this.ease(percent)
    }

    this.transform(percent)
  }

  /**
   * Pauses animation
   */
  pause() {
    this.diff = performance.now() - (this.start || 0)
  }

  /**
   * Resumes animation
   */
  resume() {
    this.start = performance.now() - (this.diff || 0)
  }

  interpolate(property, percent) {
    return this.get(property).interpolate(percent)
  }

  /**
   * Transforms item
   * @param {number} percent
   */
  transform(percent) {
    for (const property in this.state) {
      this.item.set(property, this.interpolate(property, percent))
    }
  }

  /**
   * Ends animation
  * @param {boolean=} abort
  * @param {boolean=} seek Is used in seek mode
   */
  end(abort = false, seek = false) {
    if (!abort) {
      this.transform(this.ease(1))
    }

    if (!seek) {
      this.start = null
    }
  }
}
