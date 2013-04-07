/**
 * Creates new Timeline and start frame loop
 * @constructor
 */
function Timeline() {
  World.call(this, true)
  this.currentTime = 0
  this.start = 0
}

Timeline.prototype = Object.create(World.prototype)
Timeline.prototype.constructor = Timeline

/**
 * Starts new frame loop
 */
Timeline.prototype.init = function () {
  this.frame = _requestAnimationFrame(update)

  var self = this
  function update(tick) {
    if (self.running) {
      self.currentTime = tick - self.start
    }
    self.update(self.currentTime)
    self.frame = _requestAnimationFrame(update)
  }
}

/**
 * Updates Items in Timeline
 * @param {number} tick
 * @fires Timeline#update
 */
Timeline.prototype.update = function (tick) {
  for (var i = 0; i < this.items.length; ++i) {
    if (this.changed || this.running) {
      this.items[i].timeline(tick)
      this.changed = false
      this.emit('update', tick)
    } else {
      this.items[i].style()
    }
  }
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
  this.changed = true
  this.currentTime = time
}
