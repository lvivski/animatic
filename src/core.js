import { Timeline } from "./timeline.js"
import { World } from "./world.js"

/**
 * Animatic
 * @type {Object}
 */
export default {
  /**
 * Creates and initializes world with frame loop
 * @return {World}
 */
  world() {
    return new World
  },
  /**
 * Creates and initializes timeline
 * @return {Timeline}
 */
  timeline() {
    return new Timeline
  }
}
