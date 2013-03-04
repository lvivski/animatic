/**
 * Creates new timeline and start frame loop
 * @param {boolean=} start
 * @constructor
 */
function Timeline() {
  World.call(this, true)
  this.currentTime = 0
  this.start = 0
}

Timeline.prototype = new World
Timeline.prototype.constructor = Timeline

/**
 * Starts new frame loop
 */
Timeline.prototype.init = function init() {
  this._frame = _requestAnimationFrame(update)

  var self = this
  function update(tick) {
    if (self.running) {
      self.currentTime = tick - self.start
    }
    self.update(self.currentTime)
    self._frame = _requestAnimationFrame(update)
  }
}

/**
 * Updates Items in Timeline
 * @param {number} tick
 */
Timeline.prototype.update = function time(tick) {
  for (var i = 0; i < this.items.length; ++i) {
    this.items[i].timeline(tick)
  }
  this.emit('update', tick)
}

/**
 * Plays timeline
 */
Timeline.prototype.play = function play() {
  this.running = true
  this.start = Date.now() - this.currentTime
}

/**
 * Pauses timeline
 */
Timeline.prototype.pause = function pause() {
  this.running = false
}

/**
 * Stops the World
 */
Timeline.prototype.stop = function stop() {
  this.currentTime = 0
  this.running = false
}

/**
 * Sets Timeline time
 * @param {number} time
 */
Timeline.prototype.seek = function seek(time) {
  this.currentTime = time
}
