/**
 * Creates new animated item
 * @param {HTMLElement} node
 * @constructor
 */
function Item(node) {
  EventEmitter.call(this)

  this.dom = node
  this.animations = []

  this.init()
}

Item.prototype = new EventEmitter
Item.prototype.constructor = Item

/**
 * Initializes item
 * adds "transform" handler
 */
Item.prototype.init = function init() {

  this.infinite = false
  
  this.running = true

  this.state = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1]
  }
}

/**
 * Updates item on frame
 * @param {number} tick
 */
Item.prototype.update = function update(tick) {
  this.animation(tick)
  this.style()
}

/**
 * Pauses item animation
 */
Item.prototype.pause = function pause() {
  if (!this.running) return
  this.animations.length && this.animations[0].pause()
  this.running = false
}

/**
 * Resumes item animation
 */
Item.prototype.resume = function resume() {
  if (this.running) return
  this.animations.length && this.animations[0].resume()
  this.running = true
}

/**
 * Sets style to the dom node
 */
Item.prototype.style = function() {
  this.dom.style[transformProperty] = this.matrix()
}

/**
 * Calculates CSS transform matrix for state
 * @return {String}
 */
Item.prototype.matrix = function() {
  var state = this.state
  return Matrix.toString(
    Matrix.multiply(
      Matrix.scale.apply(null, state.scale),
      Matrix.rotate.apply(null, state.rotate),
      Matrix.translate.apply(null, state.translate)
    )
  )
}

/**
 * Adds values to state params
 * @param {string} type
 * @param {Array} a
 */
Item.prototype.add = function add(type, a) {
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
Item.prototype.set = function set(type, a) {
  this.state[type] = a
  return this
}

/**
 * Translates item in XYZ axis
 * @param {Array} t Coordinates
 */
Item.prototype.translate = function translate(t) {
  return this.add('translate', t)
}

/**
 * Rotates item in XYZ
 * @param {Array} r Angles in radians
 */
Item.prototype.rotate = function rotate(r) {
  return this.add('rotate', r)
}

/**
 * Scale item in XYZ
 * @param {Array} s Scale values
 */
Item.prototype.scale = function scale(s) {
  return this.add('scale', s)
}

/**
 * Clears item transform
 */
Item.prototype.clear = function clear() {
  this.state.translate = [0, 0, 0]
  this.state.rotate = [0, 0, 0]
  this.state.scale = [1, 1, 1]
}

/**
 * Adds animation
 * @param {Object|Array} transform
 * @param {number} duration
 * @param {string} ease
 * @param {number} delay
 * @return {Animation|Parallel}
 */
Item.prototype.animate = function animate(transform, duration, ease, delay) {
  var ctor = Array.isArray(transform) ? Parallel : Animation,
      animation = new ctor(this, transform, duration, ease, delay)

  this.animations.push(animation)

  return animation
}

/**
 * Runs animation on frame
 * @param {number} tick
 */
Item.prototype.animation = function animation(tick) {
  if (!this.running || this.animations.length === 0) return

  while (this.animations.length !== 0) {
    var first = this.animations[0]
    first.init(tick)
    if (first.start + first.delay + first.duration <= tick) {
      this.infinite && this.animations.push(first)
      this.animations.shift()
      first.end()
      continue
    }
    first.run(tick)
    break
  }
}

/**
 * Finishes all Item animations
 * @param {boolean} abort
 */
Item.prototype.finish = function finish(abort) {
  if (this.animations.length === 0) return this
  for (var i = 0; i < this.animations.length; ++i) {
    var a = this.animations[i]
    a.end(abort)
  }
  this.animations = []

  this.infinite = false

  return this
}

/**
 * Stops all Item animations
 */
Item.prototype.stop = function stop() {
  return this.finish(true)
}

Item.prototype.css = function css() {
  return new CSS(this, this.animations)
}
