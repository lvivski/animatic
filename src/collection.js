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

Collection.prototype.add = function (transform, duration, ease, delay) {
  var animation
  if (Array.isArray(transform)) {
    animation = new Parallel(this.item)

    transform.forEach(function(t){
      if (t.sequence) {
	var sequence = new Sequence(this.item)
	animation.animations.push(sequence)
	t.sequence.forEach(function (s) {
	  sequence.add(s, duration, ease, delay)
	})
      } else {
	animation.add(t, duration, ease, delay)
      }
    })
  } else {
    animation = new Animation(this.item, transform, duration, ease, delay)
  }

  this.animations.push(animation)

  if (this instanceof Parallel) {
    this.duration = Math.max.apply(null, this.animations.map(function (a) {
      return a.duration + a.delay
    }))
  } else {
    this.duration = this.animations.map(function (a) {
      return a.duration + a.delay
    }).reduce(function (a, b) {
      return a + b
    }, 0)
  }

}
