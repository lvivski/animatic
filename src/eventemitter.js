export class EventEmitter {
  constructor() {
    /** @type {Record<string, Array<(...args: Array<unknown>) => unknown>>} */
    this.handlers = {}
  }

  /**
   * Adds handler for event
   * @param {string} event
  * @param {(...args: Array<unknown>) => unknown} handler
   * @returns {EventEmitter}
   */
  on(event, handler) {
    this.handlers[event] ??= []
    this.handlers[event].push(handler)
    return this
  }

  /**
   * Removes event handler
   * @param {string} event
  * @param {((...args: Array<unknown>) => unknown)=} handler
   * @returns {EventEmitter}
   */
  off(event, handler) {
    const handlers = this.handlers[event]

    if (handler) {
      if (!handlers) return this
      const index = handlers.indexOf(handler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    } else {
      delete this.handlers[event]
    }

    return this
  }

  /**
   * Triggers event
   * @param {string} event
  * @param {...unknown} args
  * @returns {EventEmitter}
   */
  emit(event, ...args) {
    const handlers = this.handlers[event]

    if (handlers) {
      for (let i = 0; i < handlers.length; ++i) {
        handlers[i].apply(this, args)
      }
    }

    return this
  }

  /**
   * List all event listeners
   * @param {string} event
  * @returns {Array<(...args: Array<unknown>) => unknown>}
   */
  listeners(event) {
    return this.handlers[event] || []
  }
}
