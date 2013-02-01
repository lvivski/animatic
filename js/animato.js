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
    translate: [0,0,0],
    rotate: [0,0,0],
    scale: [1,1,1]
  }
  
  this.transform = {
    translate: [0,0,0],
    rotate: [0,0,0],
    scale: [0,0,0]
  }
  
  this.animation = {
    duration: 500,
    translate: 1,
    rotate: 0.1,
    scale: 0.1
  }

  this.animationStart = this.timestamp = Date.now()
}

Item.prototype.update = function() {
  var self = this
  this.animate()
  this.dom.style.webkitTransform = matrix(multiply.apply(null, Object.keys(this.state).map(function(t){ return window[t].apply(null, self.state[t]) })))
}

Item.prototype.setTransform = function(transform) {
  this.dom.style.webkitTransform = transform
}

Item.prototype.reset = function() {
  this.setTransform('none')
}

Item.prototype.clear = function() {
  this.transform.translate = [0, 0, 0]
  this.transform.rotate = [0, 0, 0]
  this.transform.scale = [0, 0, 0]
}

Item.prototype.move = function(m) {
  this.state.translate[0] += m[0]
  this.state.translate[1] += m[1]
  this.state.translate[2] += m[2]
}

Item.prototype.rotate = function(r) {
  this.state.rotate[0] += r[0]
  this.state.rotate[1] += r[1]
  this.state.rotate[2] += r[2]
}

Item.prototype.scale = function(s) {
  this.state.scale[0] += s[0]
  this.state.scale[1] += s[1]
  this.state.scale[2] += S[2]
}

Item.prototype.animate = function() {
  var now = Date.now(),
      diff = now - this.timestamp
  now - this.start > this.animation.duration && this.clear()
  
  if (this.transform.translate[0] || this.transform.translate[1] || this.transform.translate[2])
    this.move([
      this.transform.translate[0] * this.animation.translate * diff,
      this.transform.translate[1] * this.animation.translate * diff,
      this.transform.translate[2] * this.animation.translate * diff
    ])
    
  if (this.transform.rotate[0] || this.transform.rotate[1] || this.transform.rotate[2])
    this.rotate([
      this.transform.rotate[0] * this.animation.rotate * diff,
      this.transform.rotate[1] * this.animation.rotate * diff,
      this.transform.rotate[2] * this.animation.rotate * diff
    ])
    
  if (this.transform.scale[0] || this.transform.scale[1] || this.transform.scale[2])
    this.scale([
      this.transform.scale[0] * this.animation.scale * diff,
      this.transform.scale[1] * this.animation.scale * diff,
      this.transform.scale[2] * this.animation.scale * diff
    ])
    
  this.timestamp = now
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

for (var i = 0; i < 100; i++) {
  var el = document.createElement('div')
  el.className = 'block'
  var item = new Item({
    dom: el
  })
  item.update = function(i){
    return function(){
      var time = Date.now() / 1000;
      this.dom.style.webkitTransform = matrix(translateZ(Math.cos(5 * (10 * i*i + time)) * 10))

    }
  }(i)
  world.items.push(item)
  container.dom.appendChild(el)
}

world.init()
    
window.addEventListener('keydown', onKeyDown, false)
window.addEventListener('keyup', function(){container.clear()}, false)

function onKeyDown(e) {
  container.start = Date.now()
  switch(e.keyCode) {
    case keys.UP:
      container.transform.rotate[0] = 1
      break
    case keys.DOWN:
      container.transform.rotate[0] = -1
      break
    case keys.LEFT:
      container.transform.rotate[1] = -1
      break
    case keys.RIGHT:
      container.transform.rotate[1] = 1
      break
    case keys.w:
      container.transform.translate[1] = 1
      break
    case keys.s:
      container.transform.translate[1] = -1
      break
    case keys.a:
      container.transform.translate[0] = -1
      break
    case keys.d:
      container.transform.translate[0] = 1
      break
  }
}