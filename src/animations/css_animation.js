import { Item } from "../item.js"
import { easings } from "./easings.js"
import { Matrix } from "../math/matrix.js"
import { animationProperty, transformProperty } from "../utils.js"

export class CssAnimation {
  /**
   * Creates new animation
   * @param {Item} item Object to animate
   * @param {Object | string} animation
   * @param {number} duration
   * @param {string} ease Timing function
   * @param {number} delay
   * @param {boolean} generated
   * @constructor
   */
  constructor(item, animation, duration, ease, delay, generated) {
    this.item = item

    this.name = animation.name || animation

    this.start = null
    this.diff = null

    this.duration = (animation.duration || duration) | 0
    this.delay = (animation.delay || delay) | 0
    this.ease = easings.css[animation.ease] || easings.css[ease] || easings.css.linear

    this._infinite = false
    this._generated = generated
  }

  /**
   * Starts animation timer
   * @param {number} tick Timestamp
   * @param {boolean=} force Force initialization
   */
  init(tick, force) {
    if (this.start !== null && !force) return
    this.start = tick + this.delay

    this.item.style(animationProperty,
      this.name + ' ' + this.duration + 'ms' + ' ' + this.ease + ' ' +
      this.delay + 'ms' + (this._infinite ? ' infinite' : '') + ' ' + 'forwards')
  }

  /**
   * Runs one tick of animation
   */
  run() {
  }

  /**
   * Pauses animation
   */
  pause() {
    this.item.style(animationProperty + '-play-state', 'paused')
    this.diff = performance.now() - this.start
  }

  /**
   * Resumes animation
   */
  resume() {
    this.item.style(animationProperty + '-play-state', 'running')
    this.start = performance.now() - this.diff
  }

  /**
   * Ends animation
   */
  end() {
    if (this._generated) {
      const computed = getComputedStyle(this.item.dom, null)
      const transform = computed[transformProperty]

      this.item.style(animationProperty, '')
      this.item.state = Matrix.decompose(Matrix.parse(transform))
      this.item.style()
    }

    this.start = null
  }
}
