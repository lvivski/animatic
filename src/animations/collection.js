import { EventEmitter } from "../eventemitter.js"
import { easings } from "./easings.js"
import { CssAnimation } from "./css_animation.js"
import { Animation } from "./animation.js"

/** @typedef {Object|Array<unknown>|string|Collection} AnimationInput */
/** @typedef {{Sequence?: Function, Parallel?: Function}} CollectionOptions */

export class Collection extends EventEmitter {
  /**
   * Creates a set of animations
  * @param {import("../item.js").Item} item
  * @param {CollectionOptions=} options
   * @constructor
   */
  constructor(item, options = {}) {
    super()

    /** @type {number | null} */
    this.start = null
    this.item = item
    this.delay = 0
    this.duration = 0
    this.ease = easings.linear
    this.easeName = "linear"
    /** @type {Array<Animation|CssAnimation|import("./sequence.js").Sequence|import("./parallel.js").Parallel>} */
    this.animations = []
    this.Sequence = options.Sequence
    this.Parallel = options.Parallel
  }

  /**
   * Add item to the collection
    * @param {AnimationInput} transform
    * @param {number=} duration
    * @param {string=} ease
    * @param {number=} delay
    * @param {boolean=} generated
    * @returns {this}
   */
  add(transform, duration, ease, delay, generated) {
    if (Array.isArray(transform)) {
      transform = parallel.call(this, this.item, transform)
    } else if (typeof transform == "string" || transform.name != undefined) {
      transform = new CssAnimation(
        this.item,
        transform,
        duration,
        ease,
        delay,
        generated
      )
    } else if (!(transform instanceof Collection)) {
      transform = new Animation(this.item, transform, duration, ease, delay)
    }

    this.animations.push(transform)

    const durations = this.animations.map(function (a) {
      return a.duration + a.delay
    })

    if (this.constructor === this.Parallel) {
      this.duration = Math.max.apply(null, durations)
    } else {
      this.duration = durations.reduce(function (a, b) {
        return a + b
      }, 0)
    }

    return this

    function sequence(item, transforms) {
      const sequence = new this.Sequence(item, {
        native: false,
        Sequence: this.Sequence,
        Parallel: this.Parallel
      })

      transforms.forEach(function (t) {
        sequence.add(t, duration, ease, delay)
      })

      return sequence
    }

    function parallel(item, transforms) {
      const parallel = new this.Parallel(item, {
        Sequence: this.Sequence,
        Parallel: this.Parallel
      })

      transforms.forEach(function (t) {
        if (Array.isArray(t)) {
          parallel.add(sequence.call(this, item, t))
        } else {
          parallel.add(t, duration, ease, delay)
        }
      }, this)

      return parallel
    }
  }

  /**
   * Collection length
   */
  get length() {
    return this.animations.length
  }

  /**
   * Get element by index
   * @param {number} index
   * @returns {Animation | Parallel}
   */
  get(index) {
    return this.animations[index]
  }

  /**
   * Remove all elements from collection
   */
  empty() {
    this.animations = []
  }

  /**
   * Add animation to collection
   * chainable
    * @param {AnimationInput} transform
    * @param {number=} duration
    * @param {string=} ease
    * @param {number=} delay
    * @returns {Collection}
   */
  animate(transform, duration, ease, delay) {
    return this.add(transform, duration, ease, delay)
  }

  /**
   * Apply styles
   * @param {boolean=} idle
  * @returns {import("../css.js").CSS}
   */
  css(idle = false) {
    return this.item.css(idle)
  }
}
