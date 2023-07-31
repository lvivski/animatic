import { Collection } from './collection'
import { CssAnimation } from './css_animation'
import { Item } from '../item'

export class Sequence extends Collection {
  /**
   * Creates a set of parallel animations
   * @param {Item} item
   * @constructor
   */
  constructor(item) {
    super(item)

    this._infinite = false
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
    this.emit('start')
  }

  /**
   * Runs one tick of animations
   * @param {number} tick
   */
  run(tick, a) {
    if (!this.animations.length) return

    while (this.animations.length !== 0) {
      a = this.animations[0]
      if (a instanceof CssAnimation) {
        a._infinite = this._infinite
      }
      a.init(tick)
      if (a.start + a.duration <= tick) {
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
    if (this.animations.length === 0) return
    let time = 0
    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i]
      a.init(time, true)
      if (a.start + a.duration <= tick) {
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
    return this
  }

  /**
   * Pauses animations
   */
  pause() {
    this.animations.length && this.animations[0].pause()
  }

  /**
   * Resumes animations
   */
  resume() {
    this.animations.length && this.animations[0].resume()
  }

  /**
   * Ends all animations in a set
   * @param {boolean} abort
   * @fires Sequence#end
   */
  end(abort = false) {
    for (let i = 0; i < this.animations.length; ++i) {
      this.animations[i].end(abort)
    }
    this.animations = []
    this._infinite = false
    this.emit('end')
  }
}
