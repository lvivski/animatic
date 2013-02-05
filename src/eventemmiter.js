/**
 * EventEmmiter
 * @constructor
 */
function EventEmitter() {
  this.handlers = {}
}

/**
 * Adds handler for event
 * @param {String} event
 * @param {Function} handler
 * @return {*}
 */
EventEmitter.prototype.on = function(event, handler) {
  (this.handlers[event] = this.handlers[event] || [])
    .push(handler)
  return this
}

/**
 * Removes event handler
 * @param {String} event
 * @param {Function} handler
 * @return {*}
 */
EventEmitter.prototype.off = function(event, handler) {
  var handlers = this.handlers[event]

  if (handler) {
    handlers.splice(handlers.indexOf(handler), 1)
  } else {
    handlers = []
  }

  return this
}

/**
 * Triggers event
 * @param {String} event
 * @return {*}
 */
EventEmitter.prototype.emit = function(event){
  var args = Array.prototype.slice.call(arguments, 1),
      handlers = this.handlers[event]

  if (handlers) {
    var len = handlers.length
    for (var i = 0; i < len; ++i) {
      handlers[i].apply(this, args)
    }
  }

  return this
}
