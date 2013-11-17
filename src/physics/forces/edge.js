/**
 * Edge force
 * @param {Vector} min
 * @param {Vector} max
 * @constructor
 */
function Edge(min, max, bounce) {
	min || (min = Vector.set(0))
	max || (max = Vector.set(0))
	bounce || (bounce = true)

	for (var i = 0; i < 3; ++i) {
		if (this.current.position[i] < min[i] || this.current.position[i] > max[i]) {
			if (bounce) {
				this.previous.position[i] = 2 * this.current.position[i] - this.previous.position[i]
			} else {
				this.current.position[i] = Math.max(min[i], Math.min(max[i], this.current.position[i]))
			}
		}
	}
}
