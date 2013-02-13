/**
 * Creates new world and start frame loop
 * @param {boolean=} start
 * @constructor
 */
function World(start) {
  this.items = []
  this._frame = null
  start && this.init()
}

/**
 * Starts new frame loop
 */
World.prototype.init = function init() {
  var self = this

  function update(tick) {
    self.update(tick)
    self._frame = requestAnimationFrame(update)
  }

  this._frame = requestAnimationFrame(update)
}

/**
 * Adds node to the animated world
 * @param {HTMLElement} node
 * @return {Item}
 */
World.prototype.add = function add(node) {
  var item = new Item(node)
  this.items.push(item)
  return item
}

/**
 * Cancels next frame
 */
World.prototype.cancel = function cancel() {
  this._frame && cancelAnimationFrame(this._frame)
}

/**
 * Stops the World
 */
World.prototype.stop = function stop() {
  this.cancel()
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].stop()
  }
}

/**
 * Pauses all animations
 */
World.prototype.pause = function pause() {
  this.cancel()
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].pause()
  }
}

/**
 * Resumes all animations
 */
World.prototype.resume = function resume() {
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].resume()
  }
  this.init()
}

/**
 * Update the World on frame
 * @param {number} tick
 */
World.prototype.update = function update(tick) {
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].update(tick)
  }
}

/**
 * Adds handler to window event
 * @param {string} event
 * @param {Function} handler
 */
World.prototype.on = function on(event, handler) {
  window.addEventListener(event, handler, true)
}
