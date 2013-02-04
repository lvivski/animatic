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

Animation.prototype.init = function init(tick) {
  if (this.start !== null) return
  this.start = tick
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

Animation.prototype.run = function run(tick) {
  var percent = (tick - this.start) / this.duration

  if (percent < 0)
    percent = 0
    
  percent = this.easing(percent)
  this.transform(percent)
}

Animation.prototype.set = function set(state, initial, transform, percent) {
  if (transform && transform.length) {
    if (transform[0]) {
      state[0] = initial[0] + transform[0] * percent
    }
    if (transform[1]) {
      state[1] = initial[1] + transform[1] * percent
    }
    if (transform[2]) {
      state[2] = initial[2] + transform[2] * percent
    }
  }
}

Animation.prototype.transform = function change(percent) {
  var state = this.item.state,
      initial = this.initial
      
  this.set(state.translate, initial.translate, this.translate, percent)
  this.set(state.rotate, initial.rotate, this.rotate, percent)
  this.set(state.scale, initial.scale, this.scale, percent)
}

Animation.prototype.end = function end(abort) {
  !abort && this.transform(1)
  this.emit('end')
}
