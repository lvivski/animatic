(function () {

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

UI.Timeline.prototype.toString = function () {
  return '<input type="button" value="keyframe">\
      <input type="range" value="0" max="' + this.max + '">\
      <input type="button" value="code" class="code">'
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
  $('.popup span').textContent = string.replace(/([;{}])/g, '$1\n')
  $('.popup').style.display = 'block'
}

UI.Popup.prototype.hide = function () {
  $('.popup').style.display = 'none'
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

  this.popup = new UI.Popup

  container.innerHTML = new UI.Panel('right', new UI.Controls + new UI.Toggler(this.timeline.items.length)) + new UI.Panel('timeline', new UI.Timeline) + this.popup

  Array.prototype.slice.call(container.childNodes).forEach(function (div) {
    document.body.appendChild(div)
  })

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

  $('.panel_timeline input[type=button]').on('click', function () {
    this_.keyframe(this_.timeline.currentTime)
  })

  $('.panel_timeline .code').on('click', function () {
    this_.stringify(this_.timeline.items[this_.current])
  })

  $('.panel_right input[type=radio]').on('click', function (e) {
    this_.current = this.dataset['index']
    populateData()
  })
  $('.panel_right input[type=radio]')[0].click()

  $('.panel_right input[type=text]').forEach(function (range) {
    var startX = 0

    function changeValue(value) {
      range.value = value
      this_.timeline.items[this_.current].state[range.dataset['transform']]
          [['x', 'y', 'z'].indexOf(range.dataset['axis'])] = range.value
    }

    function mouseMove(e) {
      e.preventDefault()
      changeValue(parseFloat(startValue) + (e.screenX - startX) * range.dataset['step'])
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

    range.on('mousedown', mouseDown)

    range.on('dblclick', function (e) {
      this.focus()
    })

    range.on('change', function (e) {
      changeValue(this.value)
    })

    range.on('keydown', function (e) {
      if (e.keyCode == 13)
        this.blur()
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

anima.editor = function () {
  var timeline = anima.timeline()
  $('.viewport').childNodes.forEach(function (node) {
    if (!(node instanceof Text))
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
