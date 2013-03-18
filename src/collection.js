/**
 * Creates a set of animations
 * @param {Item} item
 * @param {Array} animations
 * @param {number} duration
 * @param {string} ease
 * @param {number} delay
 * @constructor
 */
function Collection(item, animations, duration, ease, delay) {
  EventEmitter.call(this)

  if (arguments.length === 0) return

  this.start = null
  this.item = item
  this.delay = delay || 0
  this.duration = duration || 0
  this.easeName = ease || 'linear'
  this.animations = []

  if (animations) {
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

    this.duration = Math.max.apply(null, this.animations.map(function (a) {
      return a.duration + a.delay
    }))
  }
}

Collection.prototype = new EventEmitter

Collection.prototype.add = function (transform, duration, ease, delay) {
  var ctor = Array.isArray(transform) ? Parallel : Animation,
      animation = new ctor(this.item, transform, duration || this.duration, ease || this.easeName, delay || this.delay)

  this.animations.push(animation)
  this.duration = Math.max.apply(null, this.animations.map(function (a) {
    return a.duration + a.delay
  }))
}
