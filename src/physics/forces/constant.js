import { Vector } from "../../math/vector"
import { Particle } from "../particle"

/**
 * Constant force
 * @param {Particle} item
 * @constructor
 */
export function Constant(item) {
  const force = Vector.sub(item.state.translate, item.current.position)

  item.current.acceleration = Vector.add(item.current.acceleration, force)
}
