import { EventEmitter } from "./eventemitter.js"
import { Item } from "./item.js"
import { Particle } from "./physics/particle.js"
import { fixTick } from "./utils.js"

export class World extends EventEmitter {
  /**
   * Creates new world and start frame loop
   * @constructor
   */
  constructor() {
    super()
    this.items = []
    this.frame = null
    this.run()
  }

  /**
   * Starts new frame loop
   */
  run() {
    const self = this

    this.frame = requestAnimationFrame(update)

    function update(tick) {
      if (fixTick) {
        tick = performance.now()
      }
      self.update(tick)
      self.frame = requestAnimationFrame(update)
    }
  }

  /**
   * Update the World on frame
   * @param {number} tick
   */
  update(tick) {
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].update(tick)
    }
  }

  /**
   * Adds node to the animated world
   * @param {HTMLElement} node
   * @param {number=} mass
   * @param {number=} viscosity
   * @param {any=} edge
   * @return {Item | Particle}
   */
  add(node, mass, viscosity, edge) {
    let item
    if (mass) {
      item = new Particle(node, mass, viscosity, edge)
    } else {
      item = new Item(node)
    }
    this.items.push(item)
    return item
  }

  /**
   * Cancels next frame
   */
  cancel() {
    this.frame && cancelAnimationFrame(this.frame)
    this.frame = 0
  }

  /**
   * Stops the World
   */
  stop() {
    this.cancel()
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].stop()
    }
  }

  /**
   * Pauses all animations
   */
  pause() {
    this.cancel()
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].pause()
    }
  }

  /**
   * Resumes all animations
   */
  resume() {
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].resume()
    }
    this.run()
  }
}
