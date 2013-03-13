/**
 * Creates new Timeline and start frame loop
 * @constructor
 */
function Timeline() {
  World.call(this, true)
  this.currentTime = 0
  this.start = 0
}

Timeline.prototype = new World

/**
 * Starts new frame loop
 */
Timeline.prototype.init = function () {
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
Timeline.prototype.update = function (tick) {
  for (var i = 0; i < this.items.length; ++i) {
    if (this._changed || this.running) {
      this.items[i].timeline(tick)
      this._changed = false
    } else {
      this.items[i].style()
    }
  }
  this.emit('update', tick)
}

/**
 * Plays/Resumes Timeline
 */
Timeline.prototype.play = function () {
  this.running = true
  this.start = Date.now() - this.currentTime
}

/**
 * Pauses Timeline
 */
Timeline.prototype.pause = function () {
  this.running = false
}

/**
 * Stops Timeline
 */
Timeline.prototype.stop = function () {
  this.currentTime = 0
  this.running = false
}

/**
 * Sets Timeline time
 * @param {number} time
 */
Timeline.prototype.seek = function (time) {
  this._changed = true
  this.currentTime = time
}
