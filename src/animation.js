/**
 * Creates new animation
 * @param {Item} item Object to animate
 * @param {Object} transform
 * @param {number} duration
 * @param {string} ease Timing function
 * @param {number} delay
 * @constructor
 */
function Animation(item, transform, duration, ease, delay) {
  EventEmitter.call(this)

  this.item = item

  this.translate = transform.translate && transform.translate.map(parseFloat)
  this.rotate = transform.rotate && transform.rotate.map(parseFloat)
  this.scale = transform.scale

  this.start = null

  this.duration = duration || transform.duration || 500

  this.delay = delay || transform.delay || 0

  this.ease = easings[ease] || easings[transform.ease] || easings.linear

  this.easeName = ease || 'linear'
}

Animation.prototype = new EventEmitter
Animation.prototype.constructor = Animation

/**
 * Starts animation timer
 * @param {number} tick Timestamp
 * @fires Animation#start
 */
Animation.prototype.init = function init(tick) {
  if (this.start !== null) return
  this.start = tick

  var state = this.item.state
  this.initial = {
    translate: state.translate.slice(),
    rotate: state.rotate.slice(),
    scale: state.scale.slice()
  }
  this.emit('start')
}

Animation.prototype.animate = function animate() {
  return this.item.animate.apply(this.item, arguments)
}

Animation.prototype.css = function css() {
  return this.item.css()
}

Animation.prototype.infinite = function infinite() {
  this.item.infinite = true
  return this
}

/**
 * Runs one tick of animation
 * @param {number} tick
 */
Animation.prototype.run = function run(tick) {
  if (tick - this.start < this.delay) return

  var percent = (tick - this.delay - this.start) / this.duration
  if (percent < 0) percent = 0
  percent = this.ease(percent)

  this.transform(percent)
}

/**
 * Sets new item state
 * @param {string} type
 * @param {Object} state
 * @param {Object} initial
 * @param {number} percent
 */
Animation.prototype.set = function set(type, state, initial, percent) {
  if (this[type] && this[type].length) {
    if (this[type][0]) {
      state[type][0] = initial[type][0] + this[type][0] * percent
    }
    if (this[type][1]) {
      state[type][1] = initial[type][1] + this[type][1] * percent
    }
    if (this[type][2]) {
      state[type][2] = initial[type][2] + this[type][2] * percent
    }
  }
}

/**
 * Transforms item
 * @param {number} percent
 */
Animation.prototype.transform = function transform(percent) {
  var state = this.item.state,
      initial = this.initial

  this.set('translate', state, initial, percent)
  this.set('rotate', state, initial, percent)
  this.set('scale', state, initial, percent)
}

/**
 * Ends animation
 * @param {boolean} abort
 * @fires Animation#end
 */
Animation.prototype.end = function end(abort) {
  !abort && this.transform(1)
  this.start = null
  this.emit('end')
}
