function Animation(item, transform, duration, easing, delay) {
  EventEmitter.call(this)
  
  this.item = item
  
  this.translate = transform.translate 
  this.rotate = transform.rotate
  this.scale = transform.scale
  
  this.start = null
  
  this.duration = duration || transform.duration || 500
  
  this.delay = delay || transform.delay || 0
  
  this.easing = easings[easing] || easings[transform.easing] || easings.linear
}

Animation.prototype = new EventEmitter
Animation.prototype.constructor = Animation

Animation.prototype.init = function init(tick) {
  if (this.start !== null) return
  this.start = tick
  
  var state = this.item.state
  this.initial = {
    translate: state.translate.slice(),
    rotate: state.rotate.slice(),
    scale: state.scale.slice()
  }
}

Animation.prototype.animation = function animaiton() {
  return this.item.animation.apply(this.item, arguments)
}

Animation.prototype.run = function run(tick) {
  if (tick - this.start < this.delay) return
  
  var percent = (tick - this.delay - this.start) / this.duration
  if (percent < 0) percent = 0
  percent = this.easing(percent)
  
  this.transform(percent)
}

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

Animation.prototype.transform = function change(percent) {
  var state = this.item.state,
      initial = this.initial
      
  this.set("translate", state, initial, percent)
  this.set("rotate", state, initial, percent)
  this.set("scale", state, initial, percent)
}

Animation.prototype.end = function end(abort) {
  !abort && this.transform(1)
  this.emit('end')
}
