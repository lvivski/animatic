function World(options) {
  this.dom = options.dom || document.body
  this.items = []
  this.init()
}

World.prototype.init = function init() {
  var self = this,
      onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
      
  onFrame(function update() {
    self.update()
    onFrame(update)
  })
}

World.prototype.update = function update() {
  for (var i = 0, len = this.items.length; i < len; i++) {
    this.items[i].update()
  }
}

function Item(options) {
  this.dom = options.dom
  
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
  
  this.animations = []
  
  this._dirty = false
}

Item.prototype.setTransform = function setTransform(transform) {
  this.dom.style.webkitTransform = transform
}

Item.prototype.update = function update() {
  var self = this
  this.animate()
  this.setTransform(matrix(
      multiply.apply(null,
        Object.keys(self.state).map(function (t) {
          return window[t].apply(null,self.state[t])
        })
      )
  ))
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

Item.prototype.animation = function animation(transform, duration, callback) {
  this.animations.push(new Animation(this, transform, duration, callback))
  
  this.transform = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [0, 0, 0]
  }
}

Item.prototype.animate = function animate() {
  if (this.animations.length === 0 && this._dirty) {
    this.animation({
      translate: this.transform.translate,
      rotate: this.transform.rotate,
    }, 500)
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
    first.run()
    break
  }
}

Item.prototype.reset = function reset() {
  if (this.animations.length === 0) return
  for (var i = 0, len = this.animations.length; i < len; i++) {
    var a = this.animations[i]
    a.end()
  }
  this.animations = []
  
  this.transform = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [0, 0, 0]
  }
}

function Animation(item, transform, duration, callback) {
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
  
  this.duration = duration || 0

  this.callback = callback
}

Animation.prototype.init = function init() {
  if (this.start !== null) return
  this.start = Date.now()
}

Animation.prototype.run = function run() {
  var percent = (Date.now() - this.start) / this.duration

  if (percent < 0)
    percent = 0
    
  var transform = this.item.state,
      initial = this.initial

  if (this.translate && (this.translate[0] || this.translate[1] || this.translate[2])) {
    transform.translate = [
      initial.translate[0] + this.translate[0] * percent,
      initial.translate[1] + this.translate[1] * percent,
      initial.translate[2] + this.translate[2] * percent
    ]
  }
  
  if (this.rotate && (this.rotate[0] || this.rotate[1] || this.rotate[2])) {
    transform.rotate = [
      initial.rotate[0] + this.rotate[0] * percent,
      initial.rotate[1] + this.rotate[1] * percent,
      initial.rotate[2] + this.rotate[2] * percent
    ]
  } 
  
  if (this.scale && (this.scale[0] || this.scale[1] || this.scale[2])) {
    transform.scale = [
      initial.scale[0] + this.scale[0] * percent,
      initial.scale[1] + this.scale[1] * percent,
      initial.scale[2] + this.scale[2] * percent
    ]
  }
}

Animation.prototype.end = function end() {
  this.callback && this.callback()
}

var container = new Item({
      dom: document.querySelector('.container')
    }),
    keys = {
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      w: 87,
      s: 83,
      d: 65,
      a: 68
    }
    
var world = new World({});

world.items.push(container)

for (var i = 0; i < 50; i++) {
  var el = document.createElement('div')
  el.className = 'block'
  var item = new Item({
    dom: el
  })
  
  !function(i){
    item.update = function(){
      var time = Date.now() / 1000;
      this.setTransform(matrix(translateZ(Math.cos(5 * (10 * i*i + time)) * 10)))
    }
  }(i)
  
  world.items.push(item)
  container.dom.appendChild(el)
}

world.init()
    
window.addEventListener('keydown', onKeyDown, false)
window.addEventListener('keyup', function(){container.reset()}, false)

function onKeyDown(e) {
  var transform = container.transform

  switch(e.keyCode) {
    case keys.UP:
      transform.rotate[0] = 10
      break
    case keys.DOWN:
      transform.rotate[0] = -10
      break
    case keys.LEFT:
      transform.rotate[1] = -10
      break
    case keys.RIGHT:
      transform.rotate[1] = 10
      break
    case keys.w:
      transform.translate[1] = 10
      break
    case keys.s:
      transform.translate[1] = -10
      break
    case keys.a:
      transform.translate[0] = -10
      break
    case keys.d:
      transform.translate[0] = 10
      break
  }
  container._dirty = true
}
