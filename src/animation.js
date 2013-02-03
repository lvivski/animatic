function Animation(item, transform, duration, easing, delay) {
  EventEmitter.call(this)
  
  this.item = item
  
  this.translate = transform.translate
  this.rotate = transform.rotate
  this.scale = transform.scale
  
  this.start = null
  
  this.duration = duration || 500
  
  this.delay = delay || 0
  
  this.easing = easings[easing] || easings.linear
}

Animation.prototype = new EventEmitter
Animation.prototype.constructor = Animation

Animation.prototype.init = function init() {
  if (this.start !== null) return
  this.start = Date.now()
  var state = this.item.state
  this.initial = {
    translate: state.translate,
    rotate: state.rotate,
    scale: state.scale
  }
}

Animation.prototype.animation = function animaiton() {
  return this.item.animation.apply(this.item, arguments)
}

Animation.prototype.run = function run(timestamp) {
  var percent = (timestamp - this.start) / this.duration

  if (percent < 0)
    percent = 0
    
  percent = this.easing(percent)
    
  this.transform(percent)
}

Animation.prototype.transform = function change(percent) {
  var state = this.item.state,
      initial = this.initial

  if (this.translate && (this.translate[0] || this.translate[1] || this.translate[2])) {
    state.translate = [
      initial.translate[0] + this.translate[0] * percent,
      initial.translate[1] + this.translate[1] * percent,
      initial.translate[2] + this.translate[2] * percent
    ]
  }
  
  if (this.rotate && (this.rotate[0] || this.rotate[1] || this.rotate[2])) {
    state.rotate = [
      initial.rotate[0] + this.rotate[0] * percent,
      initial.rotate[1] + this.rotate[1] * percent,
      initial.rotate[2] + this.rotate[2] * percent
    ]
  } 
  
  if (this.scale && (this.scale[0] || this.scale[1] || this.scale[2])) {
    state.scale = [
      initial.scale[0] + this.scale[0] * percent,
      initial.scale[1] + this.scale[1] * percent,
      initial.scale[2] + this.scale[2] * percent
    ]
  }
}

Animation.prototype.end = function end(abort) {
  !abort && this.transform(1)
  this.emit('end')
}
