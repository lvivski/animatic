/**
 * Creates a set of parallel animations
 * @param {Item} item
 * @constructor
 */
function Sequence(item) {
  Collection.call(this, item)

  this._infinite = false
}

Sequence.prototype = Object.create(Collection.prototype)
Sequence.prototype.constructor = Sequence

/**
 * Initializes all animations in a set
 * @param {number} tick
 * @param {boolean=} force Force initialization
 * @fires Sequence#start
 */
Sequence.prototype.init = function (tick, force) {
  if (this.start !== null && !force) return

  this.start = tick
  this.animations[0].init(tick, force)
  this.emit('start')
}

/**
 * Runs one tick of animations
 * @param {number} tick
 */
Sequence.prototype.run = function (tick) {
  while (this.animations.length !== 0) {
    var first = this.animations[0]
    first.init(tick)
    if (first.start + first.duration <= tick) {
      this._infinite && this.animations.push(first)
      this.animations.shift()
      first.end()
      continue
    }
    first.run(tick)
    break
  }
}

/**
 * Seeks animations
 * @param {number} tick
 */
Sequence.prototype.seek = function (tick) {
  if (this.animations.length === 0) return
  var time = 0
  for (var i = 0; i < this.animations.length; ++i) {
    var a = this.animations[i]
    a.init(time, true)
    if (a.start + a.duration <= tick) {
      a.end()
      time += a.delay + a.duration
      continue
    }
    a.run(tick)
    break
  }
}

/**
 * Play animation infinitely
 * @returns {Sequence}
 */
Sequence.prototype.infinite = function () {
  this._infinite = true
  return this
}

/**
 * Pauses animations
 */
Sequence.prototype.pause = function () {
  this.animations.length && this.animations[0].pause()
}

/**
 * Resumes animations
 */
Sequence.prototype.resume = function () {
  this.animations.length && this.animations[0].resume()
}

/**
 * Ends all animations in a set
 * @param {boolean} abort
 * @fires Sequence#end
 */
Sequence.prototype.end = function (abort) {
  for (var i = 0; i < this.animations.length; ++i) {
    this.animations[i].end(abort)
  }
  this.animations = []
  this._infinite = false
  this.emit('end')
}
