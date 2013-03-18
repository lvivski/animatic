/**
 * Creates new world and start frame loop
 * @param {boolean=} start
 * @constructor
 */
function World(start) {
  EventEmitter.call(this)
  this.items = []
  this.frame = null
  start && this.init()
}

World.prototype = new EventEmitter
World.prototype.constructor = World

/**
 * Starts new frame loop
 */
World.prototype.init = function () {
  var self = this

  this.frame = _requestAnimationFrame(update)

  function update(tick) {
    self.update(tick)
    self.frame = _requestAnimationFrame(update)
  }
}

/**
 * Update the World on frame
 * @param {number} tick
 */
World.prototype.update = function (tick) {
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].update(tick)
  }
}

/**
 * Adds node to the animated world
 * @param {HTMLElement} node
 * @return {Item}
 */
World.prototype.add = function (node) {
  var item = new Item(node)
  this.items.push(item)
  return item
}

/**
 * Cancels next frame
 */
World.prototype.cancel = function () {
  this.frame && _cancelAnimationFrame(this.frame)
  this.frame = 0
}

/**
 * Stops the World
 */
World.prototype.stop = function () {
  this.cancel()
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].stop()
  }
}

/**
 * Pauses all animations
 */
World.prototype.pause = function () {
  this.cancel()
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].pause()
  }
}

/**
 * Resumes all animations
 */
World.prototype.resume = function () {
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].resume()
  }
  this.init()
}
