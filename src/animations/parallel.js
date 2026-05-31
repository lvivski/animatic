import { Collection } from "./collection.js"

export class Parallel extends Collection {
  /**
   * Creates a set of parallel animations
    * @param {import("../item.js").Item} item
    * @param {{Sequence?: Function, Parallel?: Function}=} options
   * @constructor
   */
  constructor(item, options = {}) {
    super(item, options)
  }

  /**
   * Calls a method on all animations
   * @param {string} method
  * @param {...unknown} args
   */
  all(method, ...args) {
    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i]
      const callable = /** @type {Record<string, (...args: Array<unknown>) => unknown>} */ (/** @type {unknown} */ (a))
      callable[method].apply(a, args)
    }
  }

  /**
   * Initializes all animations in a set
   * @param {number} tick
   * @param {boolean=} force Force initialization
   * @fires Parallel#start
   */
  init(tick, force) {
    if (this.start !== null && !force) return
    this.start = tick
    this.all("init", tick, force)
    this.emit("start")
  }

  /**
   * Runs one tick of animations
   * @param {number} tick
   */
  run(tick) {
    if (!this.animations.length) return

    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i]
      if ((a.start || 0) + a.duration <= tick) {
        this.animations.splice(i--, 1)
        a.end(false, false)
        continue
      }
      a.run(tick, false)
    }
    this.item.style()

    if (!this.animations.length) {
      this.end()
    }
  }

  /**
   * Seeks to the animation tick
   * @param {number} tick
   */
  seek(tick) {
    this.run(tick)
  }

  /**
   * Pauses animations
   */
  pause() {
    this.all("pause")
  }

  /**
   * Resumes animations
   */
  resume() {
    this.all("resume")
  }

  /**
   * Ends all animations in a set
   * @param {boolean} abort
   * @fires Parallel#end
   */
  end(abort = false) {
    this.all("end", abort)
    this.emit("end")
  }
}
