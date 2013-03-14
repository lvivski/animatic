var timeline = anima.timeline(),
    item = timeline.add(document.querySelector('.viewport div')),
    keyframes = []

var State = {
  initial: {
    translate: [0,0,0],
    rotate: [0,0,0],
    scale:[1,1,1]
  },
  copy: function (state) {
    return {
      translate: state.translate.slice(),
      rotate: state.rotate.slice(),
      scale: state.scale.slice()
    }
  },
  diff: function (prev, next) {
    function differ(type) {
      return function (t, i) {
	return t - prev[type][i]
      }
    }
    return {
      translate: next.translate.map(differ('translate')),
      rotate: next.rotate.map(differ('rotate')),
      scale: next.scale.map(differ('scale'))
    }
  }
}

timeline.on('update', function(time) {
  document.querySelector('.timeline input').value = time

  !['translate','rotate','scale'].forEach(function(t){
    [0,1,2].forEach(function(a) {
      document.querySelector('.controls input[data-transform='+ t +'][data-axis="' + a + '"]').value = item.state[t][a]
    })
  })
})

function createKeyframe(item, time) {
  var index = timeline.items.indexOf(item),
      state = State.copy(item.state)

  keyframes[index] || (keyframes[index] = [])
  keyframes[index].push({time: time, state: state})
  keyframes[index] = keyframes[index].sort(function(a, b) { return a.time - b.time })

  parseKeyframes(item)
  item.state = State.copy(state)
}

function parseKeyframes(item) {
  item.stop()
  item.clear()

  var index = timeline.items.indexOf(item),
      prevState = State.initial,
      prevTime = 0

  keyframes[index].forEach(function(frame) {
    item.animate(State.diff(prevState, frame.state), frame.time - prevTime)
    prevState = State.copy(frame.state)
    prevTime = frame.time
  })
}

document.querySelector('.timeline input[type=range]').addEventListener('change', function () {
  timeline.seek(this.value)
}, false)

document.querySelector('.timeline input[type=button]').addEventListener('click', function () {
  createKeyframe(item, timeline.currentTime)
}, false)

Array.prototype.slice.call(document.querySelectorAll('.controls input[type=range]'))
.forEach(function(range){
  range.addEventListener("change", function () {
    item.state[this.dataset['transform']][this.dataset['axis']] = this.value
  }, false)
})