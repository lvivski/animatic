/**
 * Constant force
 * @constructor
 */
function Constant() {
	var force = Vector.sub(this.state.translate, this.current.position)

	this.current.acceleration = Vector.add(this.current.acceleration, force)
}
