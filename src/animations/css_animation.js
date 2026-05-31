import { easings } from "./easings.js"
import { Matrix } from "../math/matrix.js"
import { animationProperty, transformProperty } from "../utils.js"

/** @typedef {{name?: string, duration?: number, delay?: number, ease?: string}} CssAnimationOptions */

export class CssAnimation {
  /**
   * Creates new animation
  * @param {import("../item.js").Item} item Object to animate
  * @param {CssAnimationOptions | string} animation
   * @param {number} duration
   * @param {string} ease Timing function
   * @param {number} delay
   * @param {boolean} generated
   * @constructor
   */
  constructor(item, animation, duration, ease, delay, generated) {
    this.item = item
    const options = typeof animation === "string" ? { name: animation } : animation
    const cssEasings = /** @type {{ css: Record<string, string> }} */ (easings).css

    this.name = options.name || ""

    /** @type {number | null} */
    this.start = null
    /** @type {number | null} */
    this.diff = null

    this.duration = (options.duration || duration) | 0
    this.delay = (options.delay || delay) | 0
    this.ease = cssEasings[options.ease || ease || "linear"] || cssEasings.linear

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

    this.item.style(
      animationProperty,
      this.name +
        " " +
        this.duration +
        "ms" +
        " " +
        this.ease +
        " " +
        this.delay +
        "ms" +
        (this._infinite ? " infinite" : "") +
        " " +
        "forwards"
    )
  }

  /**
   * Runs one tick of animation
   */
  run() {}

  /**
   * Pauses animation
   */
  pause() {
    this.item.style(animationProperty + "-play-state", "paused")
    this.diff = performance.now() - (this.start || 0)
  }

  /**
   * Resumes animation
   */
  resume() {
    this.item.style(animationProperty + "-play-state", "running")
    this.start = performance.now() - (this.diff || 0)
  }

  /**
   * Ends animation
   */
  end() {
    if (this._generated) {
      const computed = getComputedStyle(this.item.dom, null)
      const transform = computed[transformProperty]

      this.item.style(animationProperty, "")
      this.item.state = Matrix.decompose(Matrix.parse(transform))
      this.item.style()
    }

    this.start = null
  }
}
