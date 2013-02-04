function Parallel(item, animations) {
  EventEmitter.call(this)
  
  this.item = item
  
  function A(args){
    Animation.apply(this, args)
  }
  A.prototype = Animation.prototype
  
  this.animations = animations.map(function(a){
    return new A([item].concat(a))
  })
  
  this.start = null
  
  this.duration = Math.max.apply(null, animations.map(function(a){
    return a[1] || 500
  }))
}

Parallel.prototype = new EventEmitter
Parallel.prototype.constructor = Parallel

Parallel.prototype.init = function init() {
  if (this.start !== null) return
  this.start = Date.now()
  for (var i = 0, len = this.animations.length; i < len; ++i) {
    this.animations[i].init()
  }
}

Parallel.prototype.animation = function animaiton() {
  return this.item.animation.apply(this.item, arguments)
}

Parallel.prototype.parallel = function animaiton() {
  return this.item.parallel.apply(this.item, arguments)
}

Parallel.prototype.run = function run(timestamp) {
  for (var i = 0; i < this.animations.length; ++i) {
    var a = this.animations[i]
    if (a.start + a.duration <= Date.now()) {
      this.animations.splice(i, 1)
      a.end()
      --i
      continue
    }
    a.run(timestamp)
  }
}

Parallel.prototype.end = function end(abort) {
  for (var i = 0, len = this.animations.length; i < len; ++i) {
    this.animations[i].end(abort)
  }
  this.emit('end')
}
