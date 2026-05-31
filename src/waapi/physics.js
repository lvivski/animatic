import { Constant } from "../physics/forces/constant.js"
import { Edge } from "../physics/forces/edge.js"
import { Verlet } from "../physics/verlet.js"
import { Vector } from "../math/vector.js"
import {
  clamp,
  cloneState,
  cloneValue,
  collectProperties,
  containsCssAnimation,
  evaluate,
  frame,
  frameInterval,
  ensureItemState
} from "./effect.js"

/** @typedef {import("../physics/particle.js").PhysicsState} PhysicsState */
/** @typedef {import("../physics/particle.js").PhysicsKinematics} PhysicsKinematics */
/** @typedef {import("../physics/particle.js").PhysicsBody} PhysicsSimulation */
/**
 * @typedef {Object} PhysicsSample
 * @property {number} time
 * @property {PhysicsState} state
 * @property {PhysicsKinematics} current
 * @property {PhysicsKinematics} previous
 * @property {number=} clock
 */
/** @typedef {import("../animations/sequence.js").Sequence & {item: import("../physics/particle.js").Particle}} PhysicsSequence */

/**
 * @param {PhysicsSequence} sequence
 * @returns {boolean}
 */
export function canUsePhysicsWaapi(sequence) {
  const item = sequence.item

  return (
    isPhysicsItem(item) &&
    item.physicsMode !== "live" &&
    !sequence._infinite &&
    sequence.length > 0 &&
    !containsCssAnimation(sequence)
  )
}

/**
 * @param {PhysicsSequence} sequence
 * @returns {import("./effect.js").NativeEffect}
 */
export function buildPhysicsEffect(sequence) {
  const item = sequence.item
  const properties = collectProperties(sequence)

  ensureItemState(item, properties)

  const baseState = cloneState(item.state)
  const duration = Math.max(sequence.duration, 0)
  const samples = sample(sequence, baseState, duration)
  const keyframes = samples.map(function (sample) {
    return frame(
      sample.state,
      properties,
      duration ? sample.time / duration : 1,
      sample.current.position
    )
  })

  if (keyframes.length === 1) {
    keyframes.unshift(frame(baseState, properties, 0, item.current.position))
  }

  return {
    duration,
    finalState: snapshotState(samples[samples.length - 1]),
    keyframes,
    properties,
    /** @param {number} time */
    stateAt(time) {
      return interpolateSamples(samples, duration ? clamp(time, 0, duration) : 0)
    },
    timing: {
      duration,
      fill: "forwards",
      iterations: 1
    }
  }
}

/**
 * @param {unknown} item
 * @returns {boolean}
 */
export function isPhysicsItem(item) {
  const candidate = /** @type {{current?: unknown, previous?: unknown, integrate?: unknown}} */ (item)
  return (
    !!candidate.current &&
    !!candidate.previous &&
    typeof candidate.integrate === "function"
  )
}

/**
 * @param {PhysicsSequence} sequence
 * @param {PhysicsState} baseState
 * @param {number} duration
 * @returns {Array<PhysicsSample>}
 */
function sample(sequence, baseState, duration) {
  const simulation = createSimulation(sequence.item, baseState)
  /** @type {Array<PhysicsSample>} */
  const samples = []
  let previousTime = 0

  addSample(samples, 0, simulation)

  for (let time = frameInterval; time < duration; time += frameInterval) {
    advance(sequence, baseState, simulation, previousTime, time)
    addSample(samples, time, simulation)
    previousTime = time
  }

  if (duration) {
    advance(sequence, baseState, simulation, previousTime, duration)
    addSample(samples, duration, simulation)
  }

  return samples
}

/**
 * @param {import("../physics/particle.js").Particle} item
 * @param {PhysicsState} baseState
 * @returns {PhysicsSimulation}
 */
function createSimulation(item, baseState) {
  return {
    state: /** @type {PhysicsState} */ (cloneState(baseState)),
    mass: item.mass,
    viscosity: item.viscosity,
    edge: item.edge || null,
    current: cloneBodyState(item.current),
    previous: cloneBodyState(item.previous)
  }
}

/**
 * @param {PhysicsSequence} sequence
 * @param {PhysicsState} baseState
 * @param {PhysicsSimulation} simulation
 * @param {number} from
 * @param {number} to
 */
function advance(sequence, baseState, simulation, from, to) {
  let time = from

  while (time < to) {
    const next = Math.min(time + frameInterval, to)
    simulation.state = /** @type {PhysicsState} */ (evaluate(
      /** @type {Parameters<typeof evaluate>[0]} */ (sequence),
      baseState,
      next
    ))
    integrate(simulation, next - time)
    time = next
  }
}

/**
 * @param {PhysicsSimulation} simulation
 * @param {number} delta
 */
function integrate(simulation, delta) {
  if (!delta) return

  Constant(simulation)

  if (simulation.edge) {
    Edge(
      simulation,
      Vector.set(simulation.edge.min),
      Vector.set(simulation.edge.max),
      simulation.edge.bounce
    )
  }

  Verlet(simulation, delta * 0.001, 1.0 - simulation.viscosity)

  if (simulation.edge) {
    Edge(
      simulation,
      Vector.set(simulation.edge.min),
      Vector.set(simulation.edge.max),
      simulation.edge.bounce
    )
  }
}

/**
 * @param {Array<PhysicsSample>} samples
 * @param {number} time
 * @param {PhysicsSimulation} simulation
 */
function addSample(samples, time, simulation) {
  samples.push({
    time,
    state: cloneState(simulation.state),
    current: cloneBodyState(simulation.current),
    previous: cloneBodyState(simulation.previous)
  })
}

/**
 * @param {Array<PhysicsSample>} samples
 * @param {number} time
 * @returns {PhysicsSample}
 */
function interpolateSamples(samples, time) {
  if (time <= samples[0].time) {
    return snapshotState(samples[0])
  }

  const last = samples[samples.length - 1]

  if (time >= last.time) {
    return snapshotState(last)
  }

  for (let i = 1; i < samples.length; ++i) {
    const next = samples[i]

    if (time <= next.time) {
      const previous = samples[i - 1]
      const percent = (time - previous.time) / (next.time - previous.time)

      return {
        time,
        state: interpolateState(previous.state, next.state, percent),
        current: interpolateBody(previous.current, next.current, percent),
        previous: interpolateBody(previous.previous, next.previous, percent),
        clock: time
      }
    }
  }

  return snapshotState(last)
}

/**
 * @param {PhysicsSample} sample
 * @returns {PhysicsSample}
 */
function snapshotState(sample) {
  return {
    time: sample.time,
    state: cloneState(sample.state),
    current: cloneBodyState(sample.current),
    previous: cloneBodyState(sample.previous),
    clock: sample.time
  }
}

/**
 * @param {PhysicsState} from
 * @param {PhysicsState} to
 * @param {number} percent
 * @returns {PhysicsState}
 */
function interpolateState(from, to, percent) {
  /** @type {PhysicsState} */
  const state = {}
  const properties = Object.keys(from).concat(
    Object.keys(to).filter(function (property) {
      return !(property in from)
    })
  )

  properties.forEach(function (property) {
    state[property] = interpolateValue(from[property], to[property], percent)
  })

  return state
}

/**
 * @param {PhysicsKinematics} from
 * @param {PhysicsKinematics} to
 * @param {number} percent
 * @returns {PhysicsKinematics}
 */
function interpolateBody(from, to, percent) {
  return {
    position: interpolateArray(from.position, to.position, percent),
    velocity: interpolateArray(from.velocity, to.velocity, percent),
    acceleration: interpolateArray(from.acceleration, to.acceleration, percent)
  }
}

/**
 * @param {unknown} from
 * @param {unknown} to
 * @param {number} percent
 * @returns {unknown}
 */
function interpolateValue(from, to, percent) {
  if (Array.isArray(from) && Array.isArray(to)) {
    return interpolateArray(from, to, percent)
  }

  if (typeof from === "number" && typeof to === "number") {
    return from + (to - from) * percent
  }

  return percent < 1 ? cloneValue(from) : cloneValue(to)
}

/**
 * @param {Array<number>} from
 * @param {Array<number>} to
 * @param {number} percent
 * @returns {Array<number>}
 */
function interpolateArray(from, to, percent) {
  return from.map(function (value, index) {
    const end = to[index]

    if (typeof value === "number" && typeof end === "number") {
      return value + (end - value) * percent
    }

    return percent < 1 ? value : end
  })
}

/**
 * @param {PhysicsKinematics} body
 * @returns {PhysicsKinematics}
 */
function cloneBodyState(body) {
  return {
    position: body.position.slice(),
    velocity: body.velocity.slice(),
    acceleration: body.acceleration.slice()
  }
}
