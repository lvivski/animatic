import { Collection } from "./collection.js"
import { CssAnimation } from "./css_animation.js"
import { Parallel } from "./parallel.js"
import { WaapiSequenceController } from "../waapi/sequence.js"

/** @typedef {{Sequence?: typeof Sequence, Parallel?: typeof Parallel, native?: boolean}} SequenceOptions */

export class Sequence extends Collection {
  /**
   * Creates a set of parallel animations
  * @param {import("../item.js").Item} item
  * @param {SequenceOptions=} options
   * @constructor
   */
  constructor(item, options = {}) {
    super(item, {
      Sequence: options.Sequence || Sequence,
      Parallel: options.Parallel || Parallel
    })

    this._infinite = false
    this.native = new WaapiSequenceController(this, options.native !== false)
  }

  /**
   * Add item to the sequence
  * @param {Object|Array<unknown>|string|Collection} transform
   * @param {number=} duration
   * @param {string=} ease
   * @param {number=} delay
   * @param {boolean=} generated
  * @returns {this}
   */
  add(transform, duration, ease, delay, generated) {
    super.add(transform, duration, ease, delay, generated)
    this.native.schedule()
    return this
  }

  empty() {
    this.native.cancel()
    super.empty()
  }

  /**
   * Initializes all animations in a set
   * @param {number} tick
   * @param {boolean=} force Force initialization
   * @fires Sequence#start
   */
  init(tick, force) {
    if (this.start !== null && !force) return

    this.start = tick
    this.animations[0].init(tick, force)
    this.emit("start")
  }

  /**
   * Runs one tick of animations
   * @param {number} tick
   */
  run(tick) {
    if (this.native.play()) return
    if (!this.animations.length) return

    let a

    while (this.animations.length !== 0) {
      a = this.animations[0]
      if (a instanceof CssAnimation) {
        a._infinite = this._infinite
      }
      a.init(tick)
      const start = a.start || 0
      if (start + a.duration <= tick) {
        if (!(this._infinite && a instanceof CssAnimation)) {
          this.animations.shift()
          a.end()
        } else {
          break
        }
        if (this._infinite && !(a instanceof CssAnimation)) {
          this.animations.push(a)
        }
        continue
      }
      a.run(tick)
      break
    }

    if (!(a instanceof CssAnimation)) {
      this.item.style()
    }

    if (!this.animations.length) {
      this.end()
    }
  }

  /**
   * Seeks animations
   * @param {number} tick
   */
  seek(tick) {
    if (this.native.seek(tick)) return
    if (this.animations.length === 0) return
    let time = 0
    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i]
      a.init(time, true)
      const start = a.start || 0
      if (start + a.duration <= tick) {
        time += a.delay + a.duration
        a.end(false, true)
        continue
      } else {
        a.run(tick, true)
      }
      break
    }
    this.item.style()
  }

  /**
   * Play animation infinitely
   * @returns {Sequence}
   */
  infinite() {
    this._infinite = true
    this.native.invalidate()
    return this
  }

  /**
   * Pauses animations
   */
  pause() {
    if (this.native.pause()) return
    if (this.animations.length) {
      this.animations[0].pause()
    }
  }

  /**
   * Resumes animations
   */
  resume() {
    if (this.native.resume()) return
    if (this.animations.length) {
      this.animations[0].resume()
    }
  }

  /**
   * Ends all animations in a set
   * @param {boolean} abort
   * @fires Sequence#end
   */
  end(abort = false) {
    if (this.native.finish(abort)) return
    for (let i = 0; i < this.animations.length; ++i) {
      this.animations[i].end(abort)
    }
    this.animations = []
    this._infinite = false
    this.emit("end")
  }
}
