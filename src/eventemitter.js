export class EventEmitter {
  constructor() {
    this.handlers = {}
  }

	/**
	 * Adds handler for event
	 * @param {string} event
	 * @param {Function} handler
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
	 * @param {Function} handler
	 * @returns {EventEmitter}
	 */
  off(event, handler) {
    const handlers = this.handlers[event]

    if (handler) {
      handlers.splice(handlers.indexOf(handler), 1)
    } else {
      delete this.handlers[event]
    }

    return this
  }

	/**
	 * Triggers event
	 * @param {string} event
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
   * @returns {Array}
   */
  listeners(event) {
    return this.handlers[event] || []
  }

}
