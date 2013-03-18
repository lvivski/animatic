/**
 * Creates new animated item
 * @param {HTMLElement} node
 * @constructor
 */
function Item(node) {
  EventEmitter.call(this)

  this.dom = node

  this.init()
}

Item.prototype = new EventEmitter
Item.prototype.constructor = Item

/**
 * Initializes item
 */
Item.prototype.init = function () {

  this.runner = new Sequence(this)

  this.running = true

  this.state = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1],
    opacity: 1
  }
}

/**
 * Updates item on frame
 * @param {number} tick
 */
Item.prototype.update = function (tick) {
  this.runner.run(tick)
  this.style()
}

/**
 * Updates item on timeline
 * @param {number} tick
 */
Item.prototype.timeline = function (tick) {
  this.clear()
  this.runner.seek(tick)
  this.style()
}

/**
 * Pauses item animation
 */
Item.prototype.pause = function () {
  if (!this.running) return
  this.runner.pause()
  this.running = false
}

/**
 * Resumes item animation
 */
Item.prototype.resume = function () {
  if (this.running) return
  this.runner.resume()
  this.running = true
}

/**
 * Sets style to the dom node
 */
Item.prototype.style = function () {
  this.dom.style[_transformProperty] = this.transform()
  this.dom.style.opacity = this.opacity()
}

/**
 * Returns transform CSS value
 * @return {string}
 */
Item.prototype.transform = function () {
  return Matrix.stringify(this.matrix())
}

/**
 * Calculates transformation matrix for the state
 * @return {Object}
 */
Item.prototype.matrix = function () {
  var state = this.state
  return Matrix.compose(
    state.translate, state.rotate, state.scale
  )
}

/**
 * Gets transformation needed to make Item in center
 * @return {Object}
 */
Item.prototype.center = function () {
  return Matrix.decompose(Matrix.inverse(this.matrix()))
}

/**
 * Rotates item to look at vector
 * @param {Array} vector
 */
Item.prototype.lookAt = function (vector) {
  var transform = Matrix.decompose(Matrix.lookAt(
    vector, this.state.translate, [0, 1, 0]
  ))
  this.state.rotate = transform.rotate
}

/**
 * Returns item opacity
 * @return {string|number}
 */
Item.prototype.opacity = function () {
  return this.state.opacity
}

/**
 * Adds values to state params
 * @param {string} type
 * @param {Array} a
 */
Item.prototype.add = function (type, a) {
  this.state[type][0] += a[0]
  this.state[type][1] += a[1]
  this.state[type][2] += a[2]
  return this
}

/**
 * Sets values to state params
 * @param {string} type
 * @param {Array} a
 */
Item.prototype.set = function (type, a) {
  this.state[type] = a
  return this
}

/**
 * Translates item in XYZ axis
 * @param {Array} t Coordinates
 */
Item.prototype.translate = function (t) {
  return this.add('translate', t)
}

/**
 * Rotates item in XYZ
 * @param {Array} r Angles in radians
 */
Item.prototype.rotate = function (r) {
  return this.add('rotate', r)
}

/**
 * Scale item in XYZ
 * @param {Array} s Scale values
 */
Item.prototype.scale = function (s) {
  return this.add('scale', s)
}

/**
 * Clears item transform
 */
Item.prototype.clear = function () {
  this.state.translate = [0, 0, 0]
  this.state.rotate = [0, 0, 0]
  this.state.scale = [1, 1, 1]
  this.state.opacity = 1
}

/**
 * Adds animation
 * @param {Object|Array} transform
 * @param {number} duration
 * @param {string} ease
 * @param {number} delay
 * @return {Sequence}
 */
Item.prototype.animate = function (transform, duration, ease, delay) {
  return this.runner.add(transform, duration, ease, delay)
}

/**
 * Finishes all Item animations
 * @param {boolean} abort
 */
Item.prototype.finish = function (abort) {
  this.runner.end(abort)
  return this
}

/**
 * Stops all Item animations
 */
Item.prototype.stop = function () {
  return this.finish(true)
}

/**
 * Generates CSS animation or transition
 * @param {boolean=} static
 * @return {CSS}
 */
Item.prototype.css = function (static) {
  return new CSS(this, static)
}
