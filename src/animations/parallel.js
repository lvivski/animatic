import { Collection } from "./collection.js"
import { Item } from "../item.js"

export class Parallel extends Collection {
  /**
   * Creates a set of parallel animations
   * @param {Item} item
   * @constructor
   */
  constructor(item) {
    super(item)
  }

  /**
   * Calls a method on all animations
   * @param {string} method
   */
  all(method) {
    const args = Array.prototype.slice.call(arguments, 1)

    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i]
      a[method].apply(a, args)
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
    this.all('init', tick, force)
    this.emit('start')
  }

  /**
   * Runs one tick of animations
   * @param {number} tick
   */
  run(tick) {
    if (!this.animations.length) return

    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i]
      if (a.start + a.duration <= tick) {
        this.animations.splice(i--, 1)
        a.end()
        continue
      }
      a.run(tick)
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
    this.all('pause')
  }

  /**
   * Resumes animations
   */
  resume() {
    this.all('resume')
  }

  /**
   * Ends all animations in a set
   * @param {boolean} abort
   * @fires Parallel#end
   */
  end(abort = false) {
    this.all('end', abort)
    this.emit('end')
  }
}
