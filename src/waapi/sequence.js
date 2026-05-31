import {
  applyState,
  buildEffect,
  canUseWaapi,
  commitComputedState
} from "./effect.js"
import {
  buildPhysicsEffect,
  canUsePhysicsWaapi,
  isPhysicsItem
} from "./physics.js"

export class WaapiSequenceController {
  /**
   * @param {import("../animations/sequence.js").Sequence & {item: import("../item.js").Item & {timelineControlled?: boolean, nativeAnimations?: boolean}}} sequence
   * @param {boolean=} enabled
   */
  constructor(sequence, enabled = true) {
    this.sequence = sequence
    this.enabled = enabled
    /** @type {import("./effect.js").NativeEffect | null} */
    this.effect = null
    /** @type {globalThis.Animation | null} */
    this.player = null
    this.scheduled = false
  }

  /**
   * @returns {boolean}
   */
  handlesPlayback() {
    return (
      this.supported() &&
      !!(this.scheduled || this.player || this.sequence.item.timelineControlled)
    )
  }

  /**
   * @returns {boolean}
   */
  supported() {
    const item = this.sequence.item

    return (
      this.enabled &&
      item.nativeAnimations !== false &&
      item.dom &&
      typeof item.dom.animate === "function" &&
      canUseNativeEffect(this.sequence)
    )
  }

  /**
   * @returns {boolean}
   */
  schedule() {
    if (!this.supported() || this.sequence.item.timelineControlled) {
      return false
    }

    if (this.player) {
      this.invalidate()
    }

    if (this.scheduled) {
      return true
    }

    this.scheduled = true
    defer(() => {
      if (!this.scheduled) return
      this.scheduled = false
      this.play()
    })

    return true
  }

  /**
   * @returns {boolean}
   */
  play() {
    if (!this.supported() || this.sequence.item.timelineControlled) {
      return false
    }

    if (!this.player) {
      this.createPlayer(false)
    } else {
      this.player.play()
    }

    return true
  }

  /**
   * @param {number} time
   * @returns {boolean}
   */
  seek(time) {
    if (!this.supported()) {
      return false
    }

    if (!this.player) {
      this.createPlayer(true)
    }

    const currentTime = this.localTime(time)

    if (!this.player) {
      if (this.effect) {
        applyState(this.sequence.item, this.effect.stateAt(currentTime))
      }
      return true
    }

    this.player.currentTime = currentTime
    this.player.pause()

    if (this.effect) {
      applyState(this.sequence.item, this.effect.stateAt(currentTime))
    }

    return true
  }

  /**
   * @returns {boolean}
   */
  pause() {
    if (!this.handlesPlayback()) {
      return false
    }

    this.scheduled = false
    if (this.player) {
      this.player.pause()
    }

    return true
  }

  /**
   * @returns {boolean}
   */
  resume() {
    if (!this.supported() || this.sequence.item.timelineControlled) {
      return false
    }

    return this.play()
  }

  /**
   * @param {boolean=} abort
   * @returns {boolean}
   */
  finish(abort = false) {
    if (!this.handlesPlayback() && !this.supported()) {
      return false
    }

    this.scheduled = false

    if (!this.effect && !abort) {
      this.effect = buildNativeEffect(this.sequence)
    }

    if (abort) {
      if (this.effect) {
        commitComputedState(this.sequence.item, this.effect.properties)
      }
    } else if (this.effect) {
      applyState(this.sequence.item, this.effect.finalState)
    }

    this.cancelPlayer()
    this.complete()

    return true
  }

  /**
   * @returns {void}
   */
  cancel() {
    this.scheduled = false
    this.cancelPlayer()
    this.effect = null
  }

  /**
   * @returns {void}
   */
  invalidate() {
    if (this.player && this.effect) {
      commitComputedState(this.sequence.item, this.effect.properties)
    }

    this.cancelPlayer()
    this.effect = null
    this.schedule()
  }

  /**
   * @param {boolean} paused
   * @returns {void}
   */
  createPlayer(paused) {
    this.effect = buildNativeEffect(this.sequence)
    const effect = this.effect

    if (!effect.duration) {
      applyState(this.sequence.item, effect.finalState)
      if (!paused || !this.sequence.item.timelineControlled) {
        this.complete()
      }
      return
    }

    this.player = this.sequence.item.dom.animate(
      effect.keyframes,
      effect.timing
    )

    if (paused) {
      this.player.pause()
    }

    this.player.onfinish = () => {
      if (!this.player || effect.timing.iterations === Infinity) return
      applyState(this.sequence.item, effect.finalState)
      this.cancelPlayer()
      this.complete()
    }
  }

  /**
   * @param {number} time
   * @returns {number}
   */
  localTime(time) {
    if (!this.effect || !this.effect.duration) {
      return 0
    }

    if (this.sequence._infinite) {
      return time % this.effect.duration
    }

    return Math.min(this.effect.duration, Math.max(0, time))
  }

  /**
   * @returns {void}
   */
  cancelPlayer() {
    if (this.player) {
      this.player.onfinish = null
      this.player.cancel()
      this.player = null
    }
  }

  /**
   * @returns {void}
   */
  complete() {
    this.effect = null
    this.sequence.animations = []
    this.sequence._infinite = false
    this.sequence.emit("end")
  }
}

/**
 * @param {() => void} callback
 */
function defer(callback) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback)
  } else {
    Promise.resolve().then(callback)
  }
}

/**
 * @param {import("../animations/sequence.js").Sequence} sequence
 * @returns {boolean}
 */
function canUseNativeEffect(sequence) {
  if (isPhysicsItem(sequence.item)) {
    return canUsePhysicsWaapi(
      /** @type {import("./physics.js").PhysicsSequence} */ (sequence)
    )
  }

  return canUseWaapi(sequence)
}

/**
 * @param {import("../animations/sequence.js").Sequence} sequence
 * @returns {import("./effect.js").NativeEffect}
 */
function buildNativeEffect(sequence) {
  return isPhysicsItem(sequence.item)
    ? buildPhysicsEffect(
        /** @type {import("./physics.js").PhysicsSequence} */ (sequence)
      )
    : buildEffect(sequence)
}
