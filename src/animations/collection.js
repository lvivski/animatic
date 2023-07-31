import { EventEmitter } from '../eventemitter.js'
import { easings } from './easings.js'
import { Item } from '../item.js'
import { CssAnimation } from './css_animation.js'
import { Animation } from './animation.js'
import { Sequence } from './sequence.js'
import { Parallel } from './parallel.js'
import { CSS } from '../css.js'

export class Collection extends EventEmitter {
  /**
   * Creates a set of animations
   * @param {Item} item
   * @constructor
   */
  constructor(item) {
    super()

    this.start = null
    this.item = item
    this.delay = 0
    this.duration = 0
    this.ease = easings.linear
    this.easeName = 'linear'
    this.animations = []
  }

  /**
   * Add item to the collection
   * @param transform
   * @param duration
   * @param ease
   * @param delay
   * @param generated
   */
  add(transform, duration, ease, delay, generated) {
    if (Array.isArray(transform)) {
      transform = parallel(this.item, transform)
    } else if (typeof transform == 'string' || transform.name != undefined) {
      transform = new CssAnimation(this.item, transform, duration, ease, delay, generated)
    } else if (!(transform instanceof Collection)) {
      transform = new Animation(this.item, transform, duration, ease, delay)
    }

    this.animations.push(transform)

    duration = this.animations.map(function (a) {
      return a.duration + a.delay
    })

    if (this instanceof Parallel) {
      this.duration = Math.max.apply(null, duration)
    } else {
      this.duration = duration.reduce(function (a, b) {
        return a + b
      }, 0)
    }

    return this

    function sequence(item, transforms) {
      const sequence = new Sequence(item)

      transforms.forEach(function (t) {
        sequence.add(t, duration, ease, delay)
      })

      return sequence
    }

    function parallel(item, transforms) {
      const parallel = new Parallel(item)

      transforms.forEach(function (t) {
        if (Array.isArray(t)) {
          parallel.add(sequence(item, t))
        } else {
          parallel.add(t, duration, ease, delay)
        }
      })

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
   * @returns {Collection}
   */
  animate(transform, duration, ease, delay) {
    return this.add(transform, duration, ease, delay)
  }

  /**
   * Apply styles
   * @returns {CSS}
   */
  css() {
    return this.item.css()
  }
}
