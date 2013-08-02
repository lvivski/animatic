(function () {
'use strict';

function $(selector, context) {
  var result = (context || document).querySelectorAll(selector)
  return result.length > 1 ? result : result[0]
}

window.on = Node.prototype.on = function (event, fn) {
  this.addEventListener(event, fn, false)
  return this
}

window.off = Node.prototype.off = function (event, fn) {
  this.removeEventListener(event, fn)
  return this
}

NodeList.prototype.forEach = [].forEach

NodeList.prototype.filter = [].filter

NodeList.prototype.on = function (event, fn) {
  this.forEach(function (el) {
    el.on(event, fn)
  })
  return this
}

NodeList.prototype.off = function (event, fn) {
  this.forEach(function (el) {
    el.off(event, fn)
  })
  return this
}

var State = {
  initial: {
    translate: [0, 0, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1]
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

var UI = {}

UI.Panel = function (type, content) {
  this.type = type
  this.content = content
}

UI.Panel.prototype.toString = function () {
  return '<div class="panel panel_' + this.type + '">\
      <div class="panel__bg"></div>\
      <div class="panel__controls">' + this.content + '</div>\
      </div>'
}

UI.Timeline = function (max) {
  this.max = max || 5000
}

UI.Timeline.prototype.keyframes = function (keyframes) {
  keyframes || (keyframes = [])

  var container = $('.panel_timeline .keyframes'),
      width = $('.panel_timeline label').clientWidth - 8,
      content = container.innerHTML = ''

  for (var i = 0; i < keyframes.length; ++i) {
    content += '<i style="left:'+ Math.round(keyframes[i].time * width / this.max) +'px"></i>'
  }

  container.innerHTML = content
}

UI.Timeline.prototype.toString = function () {
  return '<input type="button" value="keyframe">\
      <label><input type="range" value="0" max="' + this.max + '"><span class="keyframes"></span></label>\
      <input type="text" value="'+ this.max +'">\
      <input type="button" value="code">'
}

UI.Controls = function () {
  this.config = {
    translate: {
      step: 1
    },
    rotate: {
      step: .5
    },
    scale: {
      step: .01
    }
  }
}

UI.Controls.prototype.toString = function () {
  var this_ = this
  return '<span class="axis"><i>x</i><i>y</i><i>z</i></span>' +
      Object.keys(this.config).map(function (t) {
        return '<div class="' + t + '"><span>' + t + '</span>' +
            ['x', 'y', 'z'].map(function (a) {
              return '<input type="text" value="' + (t === 'scale' ? 1 : 0) + '" \
                data-step="' + this_.config[t].step + '" data-transform="' + t + '" data-axis="' + a + '">'
            }).join('') + '</div>'
      }).join('')
}

UI.Popup = function () {}

UI.Popup.prototype.toString = function () {
  return '<div class="popup"><a href="#">×</a><span></span></div>'
}

UI.Popup.prototype.show = function (string) {
  $('.editor .popup span').textContent = string.replace(/([;{}])/g, '$1\n')
  $('.editor .popup').style.display = 'block'
}

UI.Popup.prototype.hide = function () {
  $('.editor .popup').style.display = 'none'
}

UI.Toggler = function (size) {
  this.size = size
}

UI.Toggler.prototype.toString = function () {
  var html = ''
  for (var i = 0; i < this.size; ++i) {
    html += '<label><input name="toggler" type="radio" data-index="' + i + '" />' + i + '</label>'
  }
  return '<div class="toggler">' + html + '</div>'
}

UI.Editor = function (timeline) {
  this.timeline = timeline
  this.init()
}

UI.Editor.prototype.init = function () {
  this.current = 0
  this.keyframes = []

  var this_ = this

  var container = document.createElement('div')
  container.classList.add('editor')

  this.popup = new UI.Popup

  this.bar = new UI.Timeline

  container.innerHTML = new UI.Panel('right', new UI.Controls + new UI.Toggler(this.timeline.items.length)) + new UI.Panel('timeline', this.bar) + this.popup

  document.body.appendChild(container)

  this.timeline.on('update', function (time) {
    $('.panel_timeline input[type=range]').value = time
    populateData()
  })

  function populateData() {
    ['translate', 'rotate', 'scale'].forEach(function (t) {
      ['x', 'y', 'z'].forEach(function (a, i) {
        $('.panel_right input[data-transform=' + t + '][data-axis="' + a + '"]')
            .value = this_.timeline.items[this_.current].state[t][i]
      })
    })
  }

  $('.panel_timeline input[type=range]').on('change', function () {
    this_.timeline.seek(this.value)
  })

  $('.panel_timeline input[value=keyframe]').on('click', function () {
    var keyframes = this_.keyframe(this_.timeline.currentTime)
    this_.bar.keyframes(keyframes)
  })

  $('.panel_timeline input[value=code]').on('click', function () {
    this_.stringify(this_.timeline.items[this_.current])
  })

  function bind(node, step, callback) {
    var startX = 0,
        startValue = node.value

    function mouseMove(e) {
      e.preventDefault()
      callback(parseFloat(startValue) + (e.screenX - startX) * step)
    }

    function mouseUp(e) {
      e.preventDefault()
      document.off('mousemove', mouseMove)
      document.off('mouseup', mouseUp)
    }

    function mouseDown(e) {
      e.preventDefault()
      startX = e.screenX
      startValue = this.value
      document.on('mousemove', mouseMove)
      document.on('mouseup', mouseUp)
    }

    node.on('mousedown', mouseDown)

    node.on('dblclick', function () {
      this.focus()
    })

    node.on('change', function () {
      callback(this.value)
    })

    node.on('keydown', function (e) {
      if (e.keyCode == 13)
        this.blur()
    })
  }

  var time = $('.panel_timeline input[type=text]')
  bind(time, 10, function (value) {
    value = Math.max(100, value)
    time.value = value
    this_.bar.max = value
    $('.panel_timeline input[type=range]').setAttribute('max', value)
    this_.bar.keyframes(this_.keyframes[this_.current])
  })

  $('.panel_right input[type=radio]').on('click', function (e) {
    this_.current = this.dataset['index']
    populateData()
    this_.bar.keyframes(this_.keyframes[this_.current])
  })
  $('.panel_right input[type=radio]')[0].click()

  $('.panel_right input[type=text]').forEach(function (range) {
    bind(range, range.dataset['step'], function (value) {
      range.value = value
      this_.timeline.items[this_.current].state[range.dataset['transform']]
          [['x', 'y', 'z'].indexOf(range.dataset['axis'])] = value
    })
  })

  $('.popup a').on('click', function () {
    this_.popup.hide()
  })
}

UI.Editor.prototype.keyframe = function (time) {
  var index = this.current,
      keyframes = this.keyframes,
      item = this.timeline.items[this.current],
      state = State.copy(item.state)

  keyframes[index] || (keyframes[index] = [])
  keyframes[index].push({time: time, state: state})
  keyframes[index] = keyframes[index].sort(function (a, b) {
    return a.time - b.time
  })

  this.animate(item)
  item.state = State.copy(state)

  return keyframes[index]
}

UI.Editor.prototype.animate = function (item) {
  item.stop()
  item.clear()

  var index = this.current,
      prevState = State.initial,
      prevTime = 0

  this.keyframes[index].forEach(function (frame) {
    item.animate(State.diff(prevState, frame.state), frame.time - prevTime)
    prevState = State.copy(frame.state)
    prevTime = frame.time
  })
}

UI.Editor.prototype.stringify = function (item) {
  item.clear()
  this.popup.show(item.css(true).keyframes('animation'))
}

anima.editor = function (nodes) {
  var timeline = anima.timeline()
  $(nodes).forEach(function (node) {
    if (node instanceof Element && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE')
      timeline.add(node)
  })
  new UI.Editor(timeline)
}

function bsearch(needle, stack, comparator) {
  var low = 0,
      high = stack.length,
      middle = 0

  while (low <= high) {
    middle = (low + high) >> 1
    var comparison = comparator(stack[middle], needle)

    if (comparison > 0) {
      low = middle + 1
    } else if (comparison < 0) {
      high = middle - 1
    } else {
      break
    }
  }
  return middle
}

}())
