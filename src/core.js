import { Timeline } from "./timeline.js"
import { World } from "./world.js"

/**
 * Animatic
 */
export default {
  /**
   * Creates and initializes world with frame loop
  * @returns {World}
   */
  world() {
    return new World()
  },
  /**
   * Creates and initializes timeline
  * @returns {Timeline}
   */
  timeline() {
    return new Timeline()
  }
}
