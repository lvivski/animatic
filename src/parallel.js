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

Parallel.prototype.init = function init(tick) {
  if (this.start !== null) return
  this.start = tick
  for (var i = 0, len = this.animations.length; i < len; ++i) {
    this.animations[i].init(tick)
  }
}

Parallel.prototype.animation = function animaiton() {
  return this.item.animation.apply(this.item, arguments)
}

Parallel.prototype.run = function run(tick) {
  for (var i = 0; i < this.animations.length; ++i) {
    var a = this.animations[i]
    if (a.start + a.duration <= tick) {
      this.animations.splice(i, 1)
      a.end()
      --i
      continue
    }
    a.run(tick)
  }
}

Parallel.prototype.end = function end(abort) {
  for (var i = 0, len = this.animations.length; i < len; ++i) {
    this.animations[i].end(abort)
  }
  this.emit('end')
}
