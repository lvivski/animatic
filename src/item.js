function Item(node) {
  EventEmitter.call(this)
  
  this.dom = node
  
  this.animations = []
  
  this._dirty = false
  
  this.init()
}

Item.prototype = new EventEmitter
Item.prototype.constructor = Item

Item.prototype.init = function init() {
  this.state = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1]
  }
  
  this.transform = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [0, 0, 0]
  }
  
  this.on('transform', function onTransform(translate, rotate, scale) {
    this.transform.translate = translate
    this.transform.rotate = rotate
    this.transform.scale = scale
    this._dirty = true
  })
}

Item.prototype.update = function update(timestamp) {
  var self = this
  this.animate(timestamp)
  this.dom.style.webkitTransform = Matrix.toString(
      Matrix.multiply.apply(null,
        Object.keys(self.state).map(function (t) {
          return Matrix[t].apply(null, self.state[t])
        })
      )
  )
}

Item.prototype.translate = function translate(t) {
  this.state.translate[0] += t[0]
  this.state.translate[1] += t[1]
  this.state.translate[2] += t[2]
}
 
Item.prototype.rotate = function rotate(r) {
  this.state.rotate[0] += r[0]
  this.state.rotate[1] += r[1]
  this.state.rotate[2] += r[2]
}
 
Item.prototype.scale = function scale(s) {
  this.state.scale[0] += s[0]
  this.state.scale[1] += s[1]
  this.state.scale[2] += s[2]
}

Item.prototype.clear = function clear() {
  this.state.translate = [0, 0, 0]
  this.state.rotate = [0, 0, 0]
  this.state.scale = [0, 0, 0]
}

Item.prototype.anim = 
Item.prototype.animation = function animation(transform, duration, easing) {
  var animation = new Animation(this, transform, duration, easing)
  
  this.animations.push(animation)
  
  this.transform = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [0, 0, 0]
  }
  
  return animation
}

Item.prototype.paranim = 
Item.prototype.parallel = function parallel(animations) {
  var parallel = new Parallel(this, animations)
  this.animations.push(parallel)
  return parallel
}

Item.prototype.animate = function animate(timestamp) {
  if (this.animations.length === 0 && this._dirty) {
    this.animation({
      translate: this.transform.translate,
      rotate: this.transform.rotate,
    })
    this._dirty = false
  }
  if (this.animations.length === 0) return
  
  while (this.animations.length !== 0) {
    var first = this.animations[0]
    first.init()
    if (first.start + first.duration <= Date.now()) {
      this.animations.shift()
      first.end()
      continue
    }
    first.run(timestamp)
    break
  }
}

Item.prototype.reset = function reset() {
  if (this.animations.length === 0) return
  for (var i = 0, len = this.animations.length; i < len; i++) {
    var a = this.animations[i]
    a.end(true)
  }
  this.animations = []
  
  this.transform = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [0, 0, 0]
  }
}
