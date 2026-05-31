import { Vector } from "../../math/vector.js"

/**
 * Constant force
 * @param {import("../particle.js").PhysicsBody} item
 * @constructor
 */
export function Constant(item) {
  const force = Vector.sub(item.state.translate, item.current.position)

  item.current.acceleration = Vector.add(item.current.acceleration, force)
}
