/**
 * Velocity Verlet Integrator
 * @param {number} delta
 * @param {number} drag
 * @constructor
 */
function Verlet(delta, drag) {
	// velocity = position - old_position
	// position = position + (velocity + acceleration * delta * delta)
	var current = this.current,
	    previous = this.previous

	current.acceleration = Vector.scale(current.acceleration, this.mass)
	current.velocity = Vector.sub(current.position, previous.position)

	if (drag !== undefined) {
		current.velocity = Vector.scale(current.velocity, drag)
	}

	previous.position = current.position
	current.position = Vector.add(current.position, Vector.add(current.velocity, Vector.scale(current.acceleration, delta * delta)))

	current.acceleration = Vector.zero()
}
