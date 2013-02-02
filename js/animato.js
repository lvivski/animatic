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
  
  this.transform = {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1]
  }
  
  this.animations = []
}

Item.prototype.update = function update() {
  var self = this
  this.animate()
  this.setTransform(matrix(
      multiply.apply(null,
        Object.keys(self.transform).map(function (t) {
          return window[t].apply(null,self.transform[t])
        })
      )
  ))
}

Item.prototype.setTransform = function setTransform(transform) {
  this.dom.style.webkitTransform = transform
}

Item.prototype.reset = function reset() {
  if (this.animations.length === 0) return
  for (var i = 0, len = this.animations.length; i < len; i++) {
    var a = this.animations[i]
    a.end()
  }
  this.animations = []
}

Item.prototype.translate = function translate(t) {
  this.transform.translate[0] += t[0]
  this.transform.translate[1] += t[1]
  this.transform.translate[2] += t[2]
}
 
Item.prototype.rotate = function rotate(r) {
  this.transform.rotate[0] += r[0]
  this.transform.rotate[1] += r[1]
  this.transform.rotate[2] += r[2]
}
 
Item.prototype.scale = function scale(s) {
  this.transform.scale[0] += s[0]
  this.transform.scale[1] += s[1]
  this.transform.scale[2] += s[2]
}


Item.prototype.clear = function clear() {
  this.transform.translate = [0, 0, 0]
  this.transform.rotate = [0, 0, 0]
  this.transform.scale = [0, 0, 0]
}

Item.prototype.animation = function animation(transform, duration, callback) {
  this.animations.push(new Animation(this, transform, duration, callback))
}

Item.prototype.animate = function animate() {
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

function Animation(item, transform, duration, callback) {
  this.item = item
  this.initial = item.transform
  
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
    
  var transform = this.item.transform,
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
  item.update = function(i){
    return function(){
      return
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
  if (container.animations.length !== 0) return
  
  var translate = [0, 0, 0],
      rotate = [0, 0, 0]

  switch(e.keyCode) {
    case keys.UP:
      rotate[0] = 1
      break
    case keys.DOWN:
      rotate[0] = -1
      break
    case keys.LEFT:
      rotate[1] = -1
      break
    case keys.RIGHT:
      rotate[1] = 1
      break
    case keys.w:
      translate[1] = 10
      break
    case keys.s:
      translate[1] = -10
      break
    case keys.a:
      translate[0] = -10
      break
    case keys.d:
      translate[0] = 10
      break
  }

  container.animation({
    translate: translate,
    rotate: rotate
  }, 500)

}
