/**
 * Attraction force
 * @param {number} radius
 * @param {number} strength
 * @constructor
 */
function Attraction(radius, strength) {
	radius || (radius = 1000)
	strength || (strength = 100)

	var force = Vector.sub(this.state.translate, this.current.position),
	    distance = Vector.length(force)

	if (distance < radius) {
		force = Vector.scale(Vector.norm(force), 1.0 - (distance * distance) / (radius * radius))

		this.current.acceleration = Vector.add(this.current.acceleration, Vector.scale(force, strength))
	}
}
