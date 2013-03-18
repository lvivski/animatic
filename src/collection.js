/**
 * Creates a set of animations
 * @param {Item} item
 * @constructor
 */
function Collection(item) {
  EventEmitter.call(this)

  this.start = null
  this.item = item
  this.delay = 0
  this.duration = 0
  this.easeName = 'linear'
  this.animations = []
}

Collection.prototype = new EventEmitter

/**
 * Add item to the collection
 * @param transform
 * @param duration
 * @param ease
 * @param delay
 */
Collection.prototype.add = function (transform, duration, ease, delay) {
  var animation

  if (transform instanceof Collection) {
    animation = transform
  } else if (Array.isArray(transform)) {
    animation = parallel(this.item, transform)
  } else {
    animation = new Animation(this.item, transform, duration, ease, delay)
  }

  this.animations.push(animation)

  duration = this.animations.map(function (a) {
    return a.duration + a.delay
  })

  if (this instanceof Parallel) {
    this.duration = Math.max.apply(null, duration)
  } else {
    this.duration = duration.reduce(function (a, b) {
      return a + b
    }, 0)
  }

  return this

  function sequence(item, transforms) {
    var sequence = new Sequence(item)

    transforms.forEach(function (t) {
      sequence.add(t, duration, ease, delay)
    })

    return sequence
  }

  function parallel(item, transforms) {
    var parallel = new Parallel(item)

    transforms.forEach(function (t) {
      if (Array.isArray(t)) {
	      parallel.add(sequence(item, t))
      } else {
	      parallel.add(t, duration, ease, delay)
      }
    })

    return parallel
  }
}

/**
 * Add animation to collection
 * chainable
 * @returns {Sequence}
 */
Collection.prototype.animate = function (transform, duration, ease, delay) {
  return this.runner.add(transform, duration, ease, delay)
}

/**
 * Apply styles
 * @returns {CSS}
 */
Collection.prototype.css = function () {
  return this.item.css()
}
