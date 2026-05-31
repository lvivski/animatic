import { Vector } from '../../math/vector.js'

/**
 * Edge force
 * @param {import('../particle.js').PhysicsBody} item
 * @param {number[]} min
 * @param {number[]} max
 * @param {boolean} bounce
 * @constructor
 */
export function Edge(
  item,
  min = Vector.set(0),
  max = Vector.set(0),
  bounce = true
) {
  for (let i = 0; i < 3; ++i) {
    if (
      item.current.position[i] < min[i] ||
      item.current.position[i] > max[i]
    ) {
      const position = Math.max(min[i], Math.min(max[i], item.current.position[i]))
      if (bounce) {
        item.previous.position[i] =
          position + item.current.position[i] - item.previous.position[i]
        item.current.position[i] = position
      } else {
        item.current.position[i] = position
      }
    }
  }
}
