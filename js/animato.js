var ticking = false,
    onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame,
    world = {
      dom: document.querySelector('.world'),
      start: Date.now(),
      timestamp: Date.now(),
      transform: {
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
      },
      state: {
        translate: [0, 0, 0],
        rotate: [0, 0, 0],
      },
      timestamp: Date.now(),
      clearTransform: function() {
        this.transform.translate = [0, 0, 0]
        this.transform.rotate = [0, 0, 0]
      },
      move: function(m) {
        this.state.translate[0] += m[0]
        this.state.translate[1] += m[1]
        this.state.translate[2] += m[2]
        this.update()
      },
      rotate: function(r) {
        this.state.rotate[0] += r[0]
        this.state.rotate[1] += r[1]
        this.state.rotate[2] += r[2]
        this.update()
      },
      update: function(){
        var self = this;
        this.dom.style.webkitTransform = matrix(multiply.apply(null, Object.keys(this.state).map(function(t){ return window[t].apply(null, self.state[t]) })))
      }
    },
    blocks = {
      list: [].slice.call(document.querySelectorAll('.block')),
      update: function(){
        var time = Date.now() / 1000;
        this.list.forEach(function(el, i) {
            el.style.webkitTransform = matrix(translateZ(Math.cos(5 * (10 * i*i + time)) * 10))
        })
      }
    }
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
    
    
// function getMatrix() {
//   return matrix(multiply.apply(null, Object.keys(transform).map(function(t){ return window[t].apply(null, transform[t]) })))
// }

// function requestTick() {
//     if (!ticking) {
//         onFrame(update)
//         ticking = true
//     }
// }

function onKeyDown(e) {
  world.start = Date.now();
  switch(e.keyCode) {
    case keys.UP:
      world.transform.rotate[0] = 1
      break;
    case keys.DOWN:
      world.transform.rotate[0] = -1
      break;
    case keys.LEFT:
      world.transform.rotate[1] = -1
      break;
    case keys.RIGHT:
      world.transform.rotate[1] = 1
      break;
    case keys.w:
      world.transform.translate[1] = 1
      break;
    case keys.s:
      world.transform.translate[1] = -1
      break;
    case keys.a:
      world.transform.translate[0] = -1
      break;
    case keys.d:
      world.transform.translate[0] = 1
      break;
  }
  // requestTick()
}

window.addEventListener('keydown', onKeyDown, false)
window.addEventListener('keyup', function(){world.clearTransform()}, false)

onFrame(function update() {
  var now = Date.now(),
      diff = now - world.timestamp
  now - world.start > 500 && world.clearTransform()
  var transform = world.transform
  ;(transform.translate[0] || transform.translate[1] || transform.translate[2]) && world.move([transform.translate[0] * 1 * diff, transform.translate[1] * 1 * diff, transform.translate[2] * 1 * diff])
  ;(transform.rotate[0] || transform.rotate[1] || transform.rotate[2]) && world.rotate([transform.rotate[0] * 0.1 * diff, transform.rotate[1] * 0.1 * diff, transform.rotate[2] * 0.1 * diff])
  
  
  blocks.update()
  onFrame(update)
  world.timestamp = now
  // ticking = false
})
