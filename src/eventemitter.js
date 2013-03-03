/**
 * EventEmitter
 * @constructor
 */
function EventEmitter() {
  this.handlers = {}
}

/**
 * Adds handler for event
 * @param {string} event
 * @param {Function} handler
 * @return {EventEmitter}
 */
EventEmitter.prototype.on = function on(event, handler) {
  (this.handlers[event] = this.handlers[event] || [])
    .push(handler)
  return this
}

/**
 * Removes event handler
 * @param {string} event
 * @param {Function} handler
 * @return {EventEmitter}
 */
EventEmitter.prototype.off = function off(event, handler) {
  var handlers = this.handlers[event]

  if (handler) {
    handlers.splice(handlers.indexOf(handler), 1)
  } else {
    this.handlers[event] = []
  }

  return this
}

/**
 * Triggers event
 * @param {string} event
 * @param {Object} ctx
 * @return {EventEmitter}
 */
EventEmitter.prototype.emit = function emit(event, ctx) {
  var args = Array.prototype.slice.call(arguments, 1),
      handlers = this.handlers[event]

  if (handlers) {
    for (var i = 0; i < handlers.length; ++i) {
      handlers[i].apply(ctx || this, args)
    }
  }

  return this
}
