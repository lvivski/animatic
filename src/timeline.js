import { fixTick } from "./utils.js"
import { World } from "./world.js"

export class Timeline extends World {

  /**
   * Creates new Timeline and start frame loop
   * @constructor
   */
  constructor() {
    super()
    this.currentTime = 0
    this.start = 0
  }

  /**
   * Starts new frame loop
   */
  run() {
    this.frame = requestAnimationFrame(update)

    const self = this

    function update(tick) {
      if (fixTick) {
        tick = performance.now()
      }
      if (self.running) {
        self.currentTime = tick - self.start
      }
      self.update(self.currentTime)
      self.frame = requestAnimationFrame(update)
    }
  }

  /**
   * Updates Items in Timeline
   * @param {number} tick
   * @fires Timeline#update
   */
  update(tick) {
    for (let i = 0, length = this.items.length; i < length; ++i) {
      const item = this.items[i]
      if (this.changed < length || this.running) {
        item.timeline(tick)
        this.changed++
        this.emit('update', tick)
      } else {
        item.style()
      }
    }
  }

  /**
   * Plays/Resumes Timeline
   */
  play() {
    this.running = true
    this.start = performance.now() - this.currentTime
  }

  /**
   * Pauses Timeline
   */
  pause() {
    this.running = false
  }

  /**
   * Stops Timeline
   */
  stop() {
    this.currentTime = 0
    this.running = false
  }

  /**
   * Sets Timeline time
   * @param {number} time
   */
  seek(time) {
    this.changed = 0
    this.currentTime = time
  }
}
