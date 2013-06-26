/**
 * Creates new animation
 * @param {Item} item Object to animate
 * @param {Object || string} animation
 * @param {number} duration
 * @param {string} ease Timing function
 * @param {number} delay
 * @constructor
 */
function CssAnimation(item, animation, duration, ease, delay, generated) {
  EventEmitter.call(this)

  this.item = item

  this.name = animation.name || animation

  this.start = null
  this.diff = null

  this.duration = (animation.duration || duration) | 0
  this.delay = (animation.delay || delay) | 0
  this.ease = easings.css[animation.ease] || easings.css[ease] || easings.css.linear

  this._infinite = false
  this._generated = generated
}

CssAnimation.prototype = Object.create(EventEmitter.prototype)
CssAnimation.prototype.constructor = CssAnimation

/**
 * Starts animation timer
 * @param {number} tick Timestamp
 * @param {boolean=} force Force initialization
 * @fires CssAnimation#start
 */
CssAnimation.prototype.init = function (tick, force) {
  if (this.start !== null && !force) return
  this.start = tick + this.delay

  this.item.style(_animationProperty, this.name + ' ' + this.duration + 'ms' + ' ' + this.ease + ' ' +
    this.delay + 'ms' + (this._infinite ? ' infinite' : '') + ' ' + 'forwards')

  this.emit('start')
}

/**
 * Runs one tick of animation
 */
CssAnimation.prototype.run = function () {}

/**
 * Pauses animation
 */
CssAnimation.prototype.pause = function () {
  this.item.style(_animationProperty + 'PlayState', 'paused')
  this.diff = Date.now() - this.start
}

/**
 * Resumes animation
 */
CssAnimation.prototype.resume = function () {
  this.item.style(_animationProperty + 'PlayState', 'running')
  this.start = Date.now() - this.diff
}

/**
 * Ends animation
 * @fires CssAnimation#end
 */
CssAnimation.prototype.end = function () {
  if (this._generated) {
    var computed = getComputedStyle(this.item.dom, null),
      transform = computed[_transformProperty],
      opacity = computed.opacity

    this.item.style(_animationProperty, '')
    this.item.state = Matrix.decompose(Matrix.parse(transform))
    this.item.state.opacity = opacity
    this.item.style()
  }

  this.start = null
  this.emit('end')
}
