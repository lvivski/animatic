import { Animation } from "../animations/animation.js"
import { Matrix } from "../math/matrix.js"
import { Tween } from "../animations/tween.js"
import { transformProperty } from "../utils.js"

/** @typedef {number|string|Array<number|string|undefined>|undefined} StateValue */
/** @typedef {Record<string, StateValue>} AnimationState */
/** @typedef {Record<string, number|string|undefined>} KeyframeRecord */
/**
 * @typedef {Object} BodyState
 * @property {Array<number>} position
 * @property {Array<number>} velocity
 * @property {Array<number>} acceleration
 */
/**
 * @typedef {Object} AppliedState
 * @property {AnimationState=} state
 * @property {BodyState=} current
 * @property {BodyState=} previous
 * @property {number=} clock
 */
/** @typedef {Record<string, Array<number>|null>} AffectedProperties */
/** @typedef {AnimationState|AppliedState} EffectState */
/**
 * @typedef {Object} EffectNode
 * @property {import("../item.js").Item=} item
 * @property {number=} length
 * @property {number=} duration
 * @property {number=} delay
 * @property {string=} name
 * @property {boolean=} _infinite
 * @property {Record<string, unknown>=} transformation
 * @property {Array<EffectNode>=} animations
 * @property {((percent: number) => number)|string=} ease
 */
/** @typedef {EffectNode & {item: import("../item.js").Item, length: number, duration: number}} EffectSequence */
/**
 * @typedef {Object} NativeEffect
 * @property {number} duration
 * @property {EffectState} finalState
 * @property {Array<KeyframeRecord>} keyframes
 * @property {Array<string>} properties
 * @property {(time: number) => EffectState} stateAt
 * @property {KeyframeAnimationOptions} timing
 */

export const frameInterval = 1000 / 60
export const transformProperties = {
  translate: true,
  rotate: true,
  scale: true
}
export const skippedProperties = {
  duration: true,
  delay: true,
  ease: true
}

/**
 * @param {EffectSequence} sequence
 * @returns {boolean}
 */
export function canUseWaapi(sequence) {
  return !containsCssAnimation(sequence) && sequence.length > 0
}

/**
 * @param {EffectSequence} sequence
 * @returns {NativeEffect}
 */
export function buildEffect(sequence) {
  const properties = collectProperties(sequence)
  const item = sequence.item

  ensureItemState(item, properties)

  const baseState = cloneState(item.state)
  const duration = Math.max(sequence.duration, 0)
  const times = collectTimes(sequence, duration)
  const keyframes = times.map(function (time) {
    const state = evaluate(sequence, baseState, time)
    return frame(state, properties, duration ? time / duration : 1)
  })

  if (keyframes.length === 1) {
    keyframes.unshift(frame(baseState, properties, 0))
  }

  return {
    duration,
    finalState: evaluate(sequence, baseState, duration),
    keyframes,
    properties,
    /** @param {number} time */
    stateAt(time) {
      const localTime = duration ? clamp(time, 0, duration) : 0
      return evaluate(sequence, baseState, localTime)
    },
    timing: {
      duration,
      fill: "forwards",
      iterations: sequence._infinite ? Infinity : 1
    }
  }
}

/**
 * @param {import("../item.js").Item & {current?: BodyState, previous?: BodyState, clock?: number|null, timelineControlled?: boolean}} item
 * @param {AppliedState|AnimationState} state
 */
export function applyState(item, state) {
  const applied = /** @type {AppliedState} */ (state)

  if (applied.state) {
    item.state = cloneState(applied.state)

    if (applied.current) {
      item.current = cloneBodyState(applied.current)
    }

    if (applied.previous) {
      item.previous = cloneBodyState(applied.previous)
    }

    if (applied.clock !== undefined && item.timelineControlled) {
      item.clock = applied.clock
    } else if (applied.clock !== undefined) {
      item.clock = null
    }
  } else {
    item.state = cloneState(/** @type {AnimationState} */ (state))
  }

  item.style()
}

/**
 * @param {import("../item.js").Item & {current?: {position: Array<number>}, previous?: {position: Array<number>}}} item
 * @param {Array<string>} properties
 */
export function commitComputedState(item, properties) {
  const computed = getComputedStyle(item.dom, null)
  let transform

  properties.forEach(function (property) {
    if (property in transformProperties) {
      transform ||= computedTransform(computed)
      item.set("translate", transform.translate)
      item.set("rotate", transform.rotate)
      item.set("scale", transform.scale)

      if (item.current && item.previous) {
        item.current.position = cloneValue(transform.translate)
        item.previous.position = cloneValue(transform.translate)
      }
    } else {
      const computedValue = /** @type {Record<string, string>} */ (
        /** @type {unknown} */ (computed)
      )[property]
      item.set(property, computedValue)
    }
  })

  item.style()
}

/**
 * @param {EffectNode} node
 * @returns {boolean}
 */
export function containsCssAnimation(node) {
  if (isCssAnimation(node)) return true
  if (!node.animations) return false

  return node.animations.some(containsCssAnimation)
}

/**
 * @param {EffectNode} node
 * @param {Array<string>=} properties
 * @returns {Array<string>}
 */
export function collectProperties(node, properties = []) {
  if (node.transformation) {
    Object.keys(node.transformation).forEach(function (property) {
      if (!(property in skippedProperties) && properties.indexOf(property) === -1) {
        properties.push(property)
      }
    })
  }

  if (node.animations) {
    node.animations.forEach(function (animation) {
      collectProperties(animation, properties)
    })
  }

  return properties
}

/**
 * @param {EffectSequence} sequence
 * @param {number} duration
 * @returns {Array<number>}
 */
function collectTimes(sequence, duration) {
  const times = [0, duration]

  addTimes(sequence, 0, times)

  for (let time = frameInterval; time < duration; time += frameInterval) {
    addTime(times, time)
  }

  return times.sort(function (a, b) {
    return a - b
  })
}

/**
 * @param {EffectNode} node
 * @param {number} start
 * @param {Array<number>} times
 */
function addTimes(node, start, times) {
  if (node.transformation) {
    const delay = node.delay || 0
    const duration = node.duration || 0
    addTime(times, start)
    addTime(times, start + delay)
    addTime(times, start + delay + duration)
    return
  }

  if (!node.animations) return

  if (isParallel(node)) {
    node.animations.forEach(function (animation) {
      addTimes(animation, start, times)
    })
    return
  }

  let cursor = start
  node.animations.forEach(function (animation) {
    addTimes(animation, cursor, times)
    cursor += totalDuration(animation)
  })
}

/**
 * @param {Array<number>} times
 * @param {number} time
 */
function addTime(times, time) {
  if (times.indexOf(time) === -1) {
    times.push(time)
  }
}

/**
 * @param {import("../item.js").Item} item
 * @param {Array<string>} properties
 */
export function ensureItemState(item, properties) {
  let computed
  let transformSet = false

  properties.forEach(function (property) {
    if (item.get(property) != null) return

    computed ||= getComputedStyle(item.dom, null)

    if (property in transformProperties) {
      if (!transformSet) {
        Animation.setItemState(item, property, computed)
        transformSet = true
      }
    } else {
      Animation.setItemState(item, property, computed)
    }
  })
}

/**
 * @param {EffectNode} node
 * @param {AnimationState} baseState
 * @param {number} time
 * @returns {AnimationState}
 */
export function evaluate(node, baseState, time) {
  if (node.transformation) {
    return evaluateAnimation(node, baseState, time)
  }

  if (isParallel(node)) {
    return evaluateParallel(node, baseState, time)
  }

  return evaluateSequence(node, baseState, time)
}

/**
 * @param {EffectNode} sequence
 * @param {AnimationState} baseState
 * @param {number} time
 * @returns {AnimationState}
 */
function evaluateSequence(sequence, baseState, time) {
  let state = cloneState(baseState)
  let cursor = 0
  const animations = sequence.animations || []

  for (let i = 0; i < animations.length; ++i) {
    const animation = animations[i]
    const duration = totalDuration(animation)

    if (time < cursor) {
      break
    }

    if (time >= cursor + duration) {
      state = evaluate(animation, state, duration)
      cursor += duration
    } else {
      state = evaluate(animation, state, time - cursor)
      break
    }
  }

  return state
}

/**
 * @param {EffectNode} parallel
 * @param {AnimationState} baseState
 * @param {number} time
 * @returns {AnimationState}
 */
function evaluateParallel(parallel, baseState, time) {
  const state = cloneState(baseState)
  const animations = parallel.animations || []

  animations.forEach(function (animation) {
    const animationState = evaluate(animation, baseState, time)
    applyAffectedState(state, animationState, affectedProperties(animation))
  })

  return state
}

/**
 * @param {EffectNode} animation
 * @param {AnimationState} baseState
 * @param {number} time
 * @returns {AnimationState}
 */
function evaluateAnimation(animation, baseState, time) {
  const state = cloneState(baseState)
  const delay = animation.delay || 0
  const duration = animation.duration || 0
  const ease = typeof animation.ease === "function" ? animation.ease : linear
  const transformation = animation.transformation || {}
  const localTime = clamp(time - delay, 0, duration)
  const percent = duration ? ease(localTime / duration) : 1

  Object.keys(transformation).forEach(function (property) {
    if (property in skippedProperties) return

    const tween = new Tween(
      baseState[property],
      transformation[property],
      property
    )
    const value = tween.interpolate(percent)

    setState(state, property, value)
  })

  return state
}

/**
 * @param {EffectNode} node
 * @param {AffectedProperties=} affected
 * @returns {AffectedProperties}
 */
function affectedProperties(node, affected = {}) {
  if (node.transformation) {
    const transformation = node.transformation
    Object.keys(transformation).forEach(function (property) {
      if (property in skippedProperties) return

      const value = transformation[property]

      if (Array.isArray(value)) {
        const indexes = /** @type {Array<number>} */ (affected[property] ||= [])
        value.forEach(function (entry, index) {
          if (entry && indexes.indexOf(index) === -1) {
            indexes.push(index)
          }
        })
      } else {
        affected[property] = null
      }
    })
  }

  if (node.animations) {
    node.animations.forEach(function (animation) {
      affectedProperties(animation, affected)
    })
  }

  return affected
}

/**
 * @param {AnimationState} state
 * @param {AnimationState} source
 * @param {AffectedProperties} affected
 */
function applyAffectedState(state, source, affected) {
  Object.keys(affected).forEach(function (property) {
    const indexes = affected[property]

    if (Array.isArray(indexes)) {
      const target = Array.isArray(state[property]) ? state[property] : []
      const sourceValue = source[property]
      state[property] = target
      indexes.forEach(function (index) {
        if (Array.isArray(sourceValue)) {
          target[index] = sourceValue[index]
        }
      })
    } else {
      state[property] = cloneValue(source[property])
    }
  })
}

/**
 * @param {AnimationState} state
 * @param {string} property
 * @param {StateValue} value
 */
function setState(state, property, value) {
  if (Array.isArray(value)) {
    const target = Array.isArray(state[property]) ? state[property] : []
    state[property] = target
    value.forEach(function (entry, index) {
      if (entry !== undefined) {
        target[index] = entry
      }
    })
  } else {
    state[property] = value
  }
}

/**
 * @param {AnimationState} state
 * @param {Array<string>} properties
 * @param {number} offset
 * @param {Array<number>=} translate
 * @returns {KeyframeRecord}
 */
export function frame(state, properties, offset, translate = state.translate) {
  /** @type {KeyframeRecord} */
  const keyframe = {
    offset: clamp(offset, 0, 1),
    easing: "linear"
  }

  if (usesTransform(properties)) {
    keyframe[transformProperty] = Matrix.stringify(
      Matrix.compose(
        toNumberArray(translate),
        toNumberArray(state.rotate),
        toNumberArray(state.scale)
      )
    )
  }

  properties.forEach(function (property) {
    if (property in transformProperties) return
    keyframe[property] = Array.isArray(state[property])
      ? state[property].join(" ")
      : state[property]
  })

  return keyframe
}

/**
 * @param {Array<string>} properties
 * @returns {boolean}
 */
function usesTransform(properties) {
  return properties.some(function (property) {
    return property in transformProperties
  })
}

/**
 * @param {EffectNode} animation
 * @returns {number}
 */
function totalDuration(animation) {
  return (animation.delay || 0) + (animation.duration || 0)
}

/**
 * @param {EffectNode} animation
 * @returns {boolean}
 */
function isCssAnimation(animation) {
  return animation.name !== undefined && !animation.transformation
}

/**
 * @param {EffectNode} collection
 * @returns {boolean}
 */
function isParallel(collection) {
  return !!(collection.constructor && collection.constructor.name === "Parallel")
}

/**
 * @param {AnimationState} state
 * @returns {AnimationState}
 */
export function cloneState(state) {
  /** @type {AnimationState} */
  const clone = {}

  Object.keys(state).forEach(function (property) {
    clone[property] = cloneValue(state[property])
  })

  return clone
}

/**
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function cloneValue(value) {
  return Array.isArray(value) ? /** @type {T} */ (value.slice()) : value
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * @param {CSSStyleDeclaration} computed
 * @returns {{translate: Array<number>, rotate: Array<number>, scale: Array<number>}}
 */
function computedTransform(computed) {
  const transform = /** @type {Record<string, string>} */ (
    /** @type {unknown} */ (computed)
  )[transformProperty]

  if (transform === "none") {
    return {
      translate: [0, 0, 0],
      rotate: [0, 0, 0],
      scale: [1, 1, 1]
    }
  }

  return Matrix.decompose(Matrix.parse(transform))
}

/**
 * @param {BodyState} body
 * @returns {BodyState}
 */
function cloneBodyState(body) {
  return {
    position: cloneValue(body.position),
    velocity: cloneValue(body.velocity),
    acceleration: cloneValue(body.acceleration)
  }
}

/**
 * @param {StateValue} value
 * @returns {Array<number>}
 */
function toNumberArray(value) {
  return Array.isArray(value) ? value.map(Number) : []
}

/**
 * @param {number} percent
 * @returns {number}
 */
function linear(percent) {
  return percent
}
