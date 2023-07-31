import { Vector } from '../../math/vector.js'
import { Particle } from '../particle.js'

/**
 * Edge force
 * @param {Particle} item
 * @param {number[]} min
 * @param {number[]} max
 * @param {boolean} bounce
 * @constructor
 */
export function Edge(item, min = Vector.set(0), max = Vector.set(0), bounce = true) {
  for (let i = 0; i < 3; ++i) {
    if (item.current.position[i] < min[i] || item.current.position[i] > max[i]) {
			if (bounce) {
        item.previous.position[i] = 2 * item.current.position[i] - item.previous.position[i]
			} else {
        item.current.position[i] = Math.max(min[i], Math.min(max[i], item.current.position[i]))
			}
		}
	}
}
