import { Vector } from './math/vector.js'
import { Sequence } from './animations/sequence.js'
import { Matrix } from './math/matrix.js'
import { EventEmitter } from './eventemitter.js'
import { CSS } from './css.js'
import { transformProperty } from './utils.js'

export class Item extends EventEmitter {
	/**
	 * Creates new animated item
	 * @param {HTMLElement} node
	 */
  constructor(node) {
    super()
    this.dom = node

    this.animation = new Sequence(this)

    this.running = true
    this.state = {}
  }
  /**
   * Updates item on frame
   * @param {number} tick
   */
  update(tick) {
    if (!this.running) return
    this.animation.run(tick)
  }

  /**
   * Updates item on timeline
   * @param {number} tick
   */
  timeline(tick) {
    this.clear()
    this.animation.seek(tick)
  }

  /**
   * Pauses item animation
   */
  pause() {
    if (!this.running) return
    this.animation.pause()
    this.running = false
  }

  /**
   * Resumes item animation
   */
  resume() {
    if (this.running) return
    this.animation.resume()
    this.running = true
  }

  /**
   * Sets style to the dom node
   * @param {string=} property
   * @param {string=} value
   */
  style(property, value) {
    const style = this.dom.style
    if (property && value) {
      style[property] = value
    } else {
      style[transformProperty] = this.transform()
      for (const property in this.state) {
        style[property] = this.get(property)
      }
    }
  }

  /**
   * Returns transform CSS value
   * @return {string}
   */
  transform() {
    return Matrix.stringify(this.matrix())
  }

  /**
   * Calculates transformation matrix for the state
   * @return {Object}
   */
  matrix() {
    const state = this.state
    return Matrix.compose(
      state.translate, state.rotate, state.scale
    )
  }

  /**
   * Gets transformation needed to make Item in center
   * @return {Object}
   */
  center() {
    return Matrix.decompose(Matrix.inverse(this.matrix()))
  }

  /**
   * Rotates item to look at vector
   * @param {Array} vector
   */
  lookAt(vector) {
    const transform = Matrix.decompose(Matrix.lookAt(
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
  set(type, value) {
    if (Array.isArray(value)) {
      this.state[type] ||= []
      for (let i = 0; i < value.length; ++i) {
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
  get(type) {
    return this.state[type]
  }

  /**
   * Clears item transform
   */
  clear() {
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
  animate(transform, duration, ease, delay) {
    return this.animation.add(transform, duration, ease, delay)
  }

  /**
   * Alternates current animation
   * @param {Object|Array} transform
   * @param {number} duration
   * @param {string} ease
   * @param {number} delay
   */
  alternate(transform, duration, ease, delay) {
    if (this.animation.length) {
      this.animation.get(0).merge(transform, duration, ease, delay)
    } else {
      this.animate.call(this, transform, duration, ease, delay)
    }
  }

	/**
	 * Finishes all Item animations
	 * @param {boolean=} abort
	 */
  finish(abort = false) {
    this.animation.end(abort)
    return this
  }

  /**
   * Stops all Item animations
   */
  stop() {
    return this.finish(true)
  }

  /**
   * Generates CSS animation or transition
   * @param {boolean=} idle
   * @return {CSS}
   */
  css(idle = false) {
    return new CSS(this, idle)
  }
}
