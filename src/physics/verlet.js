import { Vector } from '../math/vector.js'
import { Particle } from './particle.js'

/**
 * Velocity Verlet Integrator
 * @param {Particle} self
 * @param {number} delta
 * @param {number} drag
 * @constructor
 */
export function Verlet(self, delta, drag) {
	// velocity = position - old_position
	// position = position + (velocity + acceleration * delta * delta)
  const current = self.current
  const previous = self.previous

  current.acceleration = Vector.scale(current.acceleration, self.mass)
	current.velocity = Vector.sub(current.position, previous.position)

	if (drag !== undefined) {
		current.velocity = Vector.scale(current.velocity, drag)
	}

	previous.position = current.position
	current.position = Vector.add(current.position, Vector.add(current.velocity, Vector.scale(current.acceleration, delta * delta)))

	current.acceleration = Vector.zero()
}
