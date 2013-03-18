/**
 * CSSify animations
 * @param {Item} item
 * @param {Array} animations
 * @param {boolean} static
 * @constructor
 */
function CSS(item, static) {
  !document.styleSheets.length && this.createStyleSheet()
  this.stylesheet = document.styleSheets[0]

  this.item = item
  this.runner = item.runner

  this.total = this.runner.duration

  !static && this.style()
}

/**
 * Creates new stylesheet and adds it to HEAD
 */
CSS.prototype.createStyleSheet = function () {
  var style = document.createElement('style')
  document.getElementsByTagName('head')[0].appendChild(style)
}

/**
 * Pauses CSS animation
 */
CSS.prototype.pause = function () {
  this.item.dom.style[_animationProperty + 'PlayState'] = 'paused'
  return this
}

/**
 * Resumes CSS animation
 */
CSS.prototype.resume = function () {
  this.item.dom.style[_animationProperty + 'PlayState'] = 'running'
  return this
}

/**
 * Stops CSS animation
 * parses current transformation matrix
 * extracts values and sets item state
 */
CSS.prototype.stop = function () {
  var computed = getComputedStyle(this.item.dom),
      transform = computed[_transformProperty],
      opacity = computed.opacity,
      style = this.item.dom.style

  style[_animationProperty] = ''
  style[_transitionProperty] = ''

  this.item.state = Matrix.decompose(Matrix.parse(transform))
  this.item.state.opacity = opacity
  this.item.style()

  return this
}


CSS.prototype.handle = function (event) {
  var onEnd = function end() {
        this.stop()
        this.item.dom.removeEventListener(vendor + event, onEnd, false)
      }.bind(this)
  this.item.dom.addEventListener(vendor + event, onEnd, false)
}

/**
 * Applies animations and sets item style
 */
CSS.prototype.style = function () {
  var animation = 'a' + Date.now() + 'r' + Math.floor(Math.random() * 1000)

  if (this.runner.animations[0] instanceof Animation &&
    this.runner.animations.length == 1) { // transition
    var a = this.runner.animations[0]
    a.init()
    this.item.dom.style[_transitionProperty] = a.duration + 'ms' + ' ' + easings.css[a.easeName] + ' ' + a.delay + 'ms'
    a.transform(1)
    this.handle('TransitionEnd')
    this.item.style()
  } else { // animation
    this.stylesheet.insertRule(this.keyframes(animation), 0)
    this.handle('AnimationEnd')
    this.item.dom.style[_animationProperty] = animation + ' ' + this.total + 'ms' + ' ' +
	(this.runner._infinite ? 'infinite' : '') + ' ' + 'forwards'
  }

  this.runner.animations = []
}

/**
 * Generates @keyframes based on animations
 * @param {string} name Animation name
 * @return {string}
 */
CSS.prototype.keyframes = function (name) {
  var time = 0,
      rule = ['@' + _vendor + 'keyframes ' + name + '{']

  for (var i = 0; i < this.runner.animations.length; ++i) {
    var a = this.runner.animations[i],
        aNext = this.runner.animations[i+1]

    a.init()

    if (a instanceof Animation) { // Single
      i === 0 && rule.push(this.frame(0, easings.css[a.easeName]))

      a.delay && rule.push(this.frame(time += a.delay))

      a.transform(1)

      rule.push(this.frame(time += a.duration, aNext && easings.css[aNext.easeName]))
    } else { // Parallel (it doesn't work with custom easings for now)
      var frames = []
      a.animations.forEach(function (a) {
        a.delay && frames.indexOf(a.delay) === -1 && frames.push(a.delay)
        a.duration && frames.indexOf(a.delay + a.duration) === -1 && frames.push(a.delay + a.duration)
      })

      frames = frames.sort(function (a, b) { return a - b })

      for (var k = 0; k < frames.length; ++k) {
        var frame = frames[k]
        for (var j = 0; j < a.animations.length; ++j) {
          var pa = a.animations[j]
          // it's animation start or it's already ended
          if (pa.delay >= frame || pa.delay + pa.duration < frame)
            continue
          pa.transform(pa.ease((frame - pa.delay) / pa.duration))
        }

        rule.push(this.frame(time += frame))
      }
    }
  }
  rule.push('}')
  return rule.join('')
}

/**
 * Calcuates percent for keyframes
 * @param {number} time
 * @return {string}
 */
CSS.prototype.percent = function (time) {
  return (time * 100 / this.total).toFixed(3)
}

/**
 * Generates one frame for @keyframes
 * @param {number} time
 * @param {string=} ease
 * @return {string}
 */
CSS.prototype.frame = function (time, ease) {
  var percent = this.percent(time)
  return percent + '% {' +
    (percent ? _vendor + 'transform:' + this.item.transform() + ';' : '') +
    (percent ? 'opacity:' + this.item.opacity() + ';' : '') +
    (ease ? _vendor + 'animation-timing-function:' + ease + ';' : '') +
    '}'
}
