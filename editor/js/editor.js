var timeline = anima.timeline(),
    item = timeline.add(document.querySelector('.viewport div')),
    keyframes = []

timeline.on('update', function(time) {
  document.querySelector('.timeline input').value = time

  ;['translate','rotate','scale'].forEach(function(t){
    [0,1,2].forEach(function(a) {
      document.querySelector('.controls input[data-transform='+ t +'][data-axis="' + a + '"]').value = item.state[t][a]
    })
  })
})

function createKeyframe(item, time) {
  var index = timeline.items.indexOf(item)
  keyframes[index] || (keyframes[index] = [])
  var state = copyState(item.state)
  keyframes[index].push({time: time, state: state})
  keyframes[index] = keyframes[index].sort(function(a, b) { return a.time - b.time })
  parseKeyframes(item)
  item.state = copyState(state)
}

function copyState(state) {
  return {
    translate: state.translate.slice(),
    rotate: state.rotate.slice(),
    scale: state.scale.slice()
  }
}

function parseKeyframes(item) {
  item.stop()
  item.clear()
  var index = timeline.items.indexOf(item),
      prevState = {
	translate: [0,0,0],
	rotate: [0,0,0],
	scale:[1,1,1]
      },
      prevTime = 0
  keyframes[index].forEach(function(frame) {
    item.animate(diffState(prevState, frame.state), frame.time - prevTime);
    prevState = copyState(frame.state)
    prevTime = frame.time
  })
}

function diffState(prev, next) {
  return {
    translate: next.translate.map(function(t, i){ return t - prev.translate[i] }),
    rotate: next.rotate.map(function(r, i){ return r - prev.rotate[i] }),
    scale: next.scale.map(function(s, i){ return s - prev.scale[i] })
  }
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