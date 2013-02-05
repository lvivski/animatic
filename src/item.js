function Item(node) {
  EventEmitter.call(this)
  
  this.dom = node
  
  this.animations = []
  
  this.state = {}
  
  this.transform = {}
  
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
  
  this.zero("transform")
  
  this.on('transform', function onTransform(translate, rotate, scale) {
    this.transform.translate = translate
    this.transform.rotate = rotate
    this.transform.scale = scale
    this._dirty = true
  })
}

Item.prototype.update = function update(tick) {
  this.animate(tick)
  this.style()
}

Item.prototype.style = function() {
  var state = this.state
  this.dom.style.webkitTransform = Matrix.toString(
    Matrix.multiply(
      Matrix.translate.apply(null, state.translate),
      Matrix.rotate.apply(null, state.rotate),
      Matrix.scale.apply(null, state.scale)
    )
  )
}

Item.prototype.add = function add(type, a) {
  this.state[type][0] += a[0]
  this.state[type][1] += a[1]
  this.state[type][2] += a[2]
}

Item.prototype.translate = function translate(t) {
  this.add("translate", t)
}
 
Item.prototype.rotate = function rotate(r) {
  this.add("rotate", r)
}
 
Item.prototype.scale = function scale(s) {
  this.add("scale", s)
}

Item.prototype.clear = function clear() {
  this.null("state")
}

Item.prototype.animation = function animation(transform, duration, easing, delay) {
  var ctor = Array.isArray(transform) ? Parallel : Animation,
      animation = new ctor(this, transform, duration, easing, delay)
  
  this.animations.push(animation)
  
  this.zero("transform")
  
  return animation
}

Item.prototype.animate = function animate(tick) {
  if (this.animations.length === 0 && this._dirty) {
    this.animation(this.transform)
    this._dirty = false
  }
  if (this.animations.length === 0) return
  
  while (this.animations.length !== 0) {
    var first = this.animations[0]
    first.init(tick)
    if (first.start + first.delay + first.duration <= tick) {
      this.animations.shift()
      first.end()
      continue
    }
    first.run(tick)
    break
  }
}

Item.prototype.zero = function zero(type) {
  this[type].translate = [0, 0, 0]
  this[type].rotate = [0, 0, 0]
  this[type].scale = [0, 0, 0]
}

Item.prototype.reset = function reset() {
  if (this.animations.length === 0) return
  for (var i = 0, len = this.animations.length; i < len; i++) {
    var a = this.animations[i]
    a.end(true)
  }
  this.animations = []
  
  this.zero("transform")
}
