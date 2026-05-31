import { fixTick } from "./utils.js"
import { World } from "./world.js"

export class Timeline extends World {
  /**
   * Creates new Timeline and start frame loop
   * @constructor
   */
  constructor() {
    super()
    this.running = false
    this.currentTime = 0
    this.start = 0
    this.changed = 0
  }

  /**
   * Starts new frame loop
   */
  run() {
    this.frame = requestAnimationFrame(update)

    const self = this

    /** @param {number} tick */
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
        this.emit("update", tick)
      } else if (!item.animation.native.handlesPlayback()) {
        item.style()
      }
    }
  }

  /**
   * Adds node to the timeline
   * @param {HTMLElement} node
   * @param {number|{mass?: number, viscosity?: number, edge?: {min?: Array<number>, max?: Array<number>, bounce?: boolean}, physics?: string}=} mass
   * @param {number=} viscosity
   * @param {{min?: Array<number>, max?: Array<number>, bounce?: boolean}=} edge
   * @returns {import("./item.js").Item|import("./physics/particle.js").Particle}
   */
  add(node, mass, viscosity, edge) {
    const item = super.add(node, mass, viscosity, edge)
    item.timelineControlled = true
    return item
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
    this.changed = 0
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
