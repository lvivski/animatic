import { Vector } from "../../math/vector.js"
import { Particle } from "../particle.js"

/**
 * Attraction force
 * @param {Particle} item
 * @param {number} radius
 * @param {number} strength
 * @constructor
 */
export function Attraction(item, radius = 1000, strength = 100) {
  let force = Vector.sub(item.state.translate, item.current.position)
  const distance = Vector.length(force)

	if (distance < radius) {
		force = Vector.scale(Vector.norm(force), 1.0 - (distance * distance) / (radius * radius))

    item.current.acceleration = Vector.add(item.current.acceleration, Vector.scale(force, strength))
	}
}
