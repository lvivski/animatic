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
  function id(x){return x}
  var state = this.item.state
  this.initial = {
    translate: state.translate.map(id),
    rotate: state.rotate.map(id),
    scale: state.scale.map(id)
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
  
  if (this.translate) {
    if (this.translate[0]) {
      state.translate[0] = initial.translate[0] + this.translate[0] * percent
    }
    if (this.translate[1]) {
      state.translate[1] = initial.translate[1] + this.translate[1] * percent
    }
    if (this.translate[2]) {
      state.translate[2] = initial.translate[2] + this.translate[2] * percent
    }
  }
  
  if (this.rotate) {
    if (this.rotate[0]) {
      state.rotate[0] = initial.rotate[0] + this.rotate[0] * percent
    }
    if (this.rotate[1]) {
      state.rotate[1] = initial.rotate[1] + this.rotate[1] * percent
    }
    if (this.rotate[2]) {
      state.rotate[2] = initial.rotate[2] + this.rotate[2] * percent
    }
  }
  
  if (this.scale) {
    if (this.scale[0]) {
      state.scale[0] = initial.scale[0] + this.scale[0] * percent
    }
    if (this.scale[1]) {
      state.scale[1] = initial.scale[1] + this.scale[1] * percent
    }
    if (this.scale[2]) {
      state.scale[2] = initial.scale[2] + this.scale[2] * percent
    }
  }
}

Animation.prototype.end = function end(abort) {
  !abort && this.transform(1)
  this.emit('end')
}
