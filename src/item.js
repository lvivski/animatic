/**
 * Creates new animated item
 * @param {HTMLElement} node
 * @constructor
 */
function Item(node) {
  EventEmitter.call(this)

  this.dom = node

  this.animations = []

  this.state = {}

  this.transform = {}

  this._dirty = false

  this.init()
}

Item.prototype = new EventEmitter
Item.prototype.constructor = Item

/**
 * Initializes item
 * adds "transform" handler
 */
Item.prototype.init = function init() {
  this.state = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1]
  }

  this.zero('transform')

  this.on('transform', function onTransform(translate, rotate, scale) {
    this.transform.translate = translate
    this.transform.rotate = rotate
    this.transform.scale = scale
    this._dirty = true
  })
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
      Matrix.translate.apply(null, state.translate),
      Matrix.rotate.apply(null, state.rotate),
      Matrix.scale.apply(null, state.scale)
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
}

/**
 * Translates item in XYZ axis
 * @param {Array} t Coordinates
 */
Item.prototype.translate = function translate(t) {
  this.add('translate', t)
}

/**
 * Rotates item in XYZ
 * @param {Array} r Angles in radians
 */
Item.prototype.rotate = function rotate(r) {
  this.add('rotate', r)
}

/**
 * Scale item in XYZ
 * @param {Array} s Scale values
 */
Item.prototype.scale = function scale(s) {
  this.add('scale', s)
}

/**
 * Clears item transform
 */
Item.prototype.clear = function clear() {
  this.zero('state')
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

  this.zero('transform')

  return animation
}

/**
 * Runs animation on frame
 * @param {number} tick
 */
Item.prototype.animation = function animation(tick) {
  if (this.animations.length === 0 && this._dirty) {
    this.animate(this.transform)
    this._dirty = false
  }
  if (this.animations.length === 0) return

  while (this.animations.length !== 0) {
    var first = this.animations[0]
    first.init(tick)
    if (first.start + first.delay + first.duration <= tick) {
      this.animations.shift()
      first.end()
      continue
    }
    first.run(tick)
    break
  }
}

/**
 * Clears Item's state or transform
 * @param {string} type
 */
Item.prototype.zero = function zero(type) {
  this[type].translate = [0, 0, 0]
  this[type].rotate = [0, 0, 0]
  this[type].scale = [0, 0, 0]
}

/**
 * Stops all Item animations
 */
Item.prototype.stop = function stop() {
  if (this.animations.length === 0) return
  for (var i = 0, len = this.animations.length; i < len; i++) {
    var a = this.animations[i]
    a.end(true)
  }
  this.animations = []

  this.zero('transform')
}

Item.prototype.css = function css() {
  return new CSS(this.animations).toString()
}
