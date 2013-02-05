/**
 * Creates new world and start frame loop
 * @param {Array=} items
 * @constructor
 */
function World(items) {
  this.items = items || []
  this.init()
}

/**
 * Starts new frame loop
 */
World.prototype.init = function init() {
  var self = this,
      onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame

  onFrame(function update(tick) {
    self.update(tick)
    onFrame(update)
  })
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
 * Update the World on frame
 * @param {number} tick
 */
World.prototype.update = function update(tick) {
  for (var i = 0, len = this.items.length; i < len; i++) {
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
