/**
 * Creates a set of parallel animations
 * @param {Item} item
 * @param {Array} animations
 * @param {number} duration
 * @param {string} ease
 * @param {number} delay
 * @constructor
 */
function Parallel(item, animations, duration, ease, delay) {
  EventEmitter.call(this)

  this.item = item

  this.animations = animations.map(function (a) {
    return new Animation(item,
      {
        translate: a.translate,
        rotate: a.rotate,
        scale: a.scale,
        opacity: a.opacity
      },
      a.duration || duration,
      a.ease || ease,
      a.delay || delay
    )
  })

  this.start = null
  this.delay = 0
  this.easeName = ease || 'linear'
  this.duration = Math.max.apply(null, this.animations.map(function (a) {
    return a.duration + a.delay
  }))
}

Parallel.prototype = new EventEmitter

/**
 * Calls a method on all animations
 * @param {string} method
 */
Parallel.prototype.all = function (method) {
  var args = Array.prototype.slice.call(arguments, 1)

  for (var i = 0; i < this.animations.length; ++i) {
    var a = this.animations[i]
    a[method].apply(a, args)
  }
}

/**
 * Initializes all animations in a set
 * @param {number} tick
 * @param {boolean=} force Force initialization
 * @fires Parallel#start
 */
Parallel.prototype.init = function (tick, force) {
  if (this.start !== null && !force) return
  this.start = tick
  this.all('init', tick, force)
  this.emit('start')
}

Parallel.prototype.animate = function () {
  return this.item.animate.apply(this.item, arguments)
}

Parallel.prototype.css = function () {
  return this.item.css()
}

Parallel.prototype.infinite = function () {
  this.item.infinite = true
  return this
}

/**
 * Runs one tick of animations
 * @param {number} tick
 */
Parallel.prototype.run = function (tick) {
  for (var i = 0; i < this.animations.length; ++i) {
    var a = this.animations[i]
    if (a.start + a.duration <= tick) {
      this.animations.splice(i--, 1)
      a.end()
      continue
    }
    a.run(tick)
  }
}

/**
 * Pauses animations
 */
Parallel.prototype.pause = function () {
  this.all('pause')
}

/**
 * Resumes animations
 */
Parallel.prototype.resume = function () {
  this.all('resume')
}

/**
 * Ends all animations in a set
 * @param {boolean} abort
 * @fires Parallel#end
 */
Parallel.prototype.end = function (abort) {
  this.all('end', abort)
  this.emit('end')
}
