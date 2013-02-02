function Animation(item, transform, duration, easing, callback) {
  this.item = item
  this.initial = {
    translate: item.state.translate,
    rotate: item.state.rotate,
    scale: item.state.scale
  }
  
  this.translate = transform.translate
  this.rotate = transform.rotate
  this.scale = transform.scale

  this.start = null
  
  this.duration = duration || 500
  
  this.easing = easings[easing] || easings.linear

  this.callback = callback
}

Animation.prototype.init = function init() {
  if (this.start !== null) return
  this.start = Date.now()
}

Animation.prototype.run = function run(timestamp) {
  var percent = (timestamp - this.start) / this.duration

  if (percent < 0)
    percent = 0
    
  percent = this.easing(percent)
    
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

Animation.prototype.end = function end() {
  this.callback && this.callback()
}