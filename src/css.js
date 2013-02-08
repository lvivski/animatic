/**
 * CSSify animations
 * @param {Array} animations
 * @constructor
 */
function CSS(animations) {
  this.stylesheet = document.styleSheets[0]

  this.animations = animations

  this.total = this.animations.map(function(a){
    return a.delay + a.duration
  }).reduce(function(a, b){
    return a + b
  })
}

/**
 * Calcuates percent for keyframes
 * @param {number} time
 * @return {String}
 */
CSS.prototype.percent = function percent(time) {
  return (time * 100 / this.total).toFixed(3)
}

/**
 * Stringifies Animations and sets item style
 */
CSS.prototype.toString = function toString() {
  var animation = 'a' + (Date.now() + Math.floor(Math.random() * 100)),
      time = 0,
      rule = ['@' + vendor + 'keyframes ' + animation + '{']

  for (var i = 0, len = this.animations.length; i < len; i++) {
    var a = this.animations[i],
        aNext = this.animations[i+1]

    a.init()

    if (a instanceof Animation) { // Single
      i === 0 && rule.push(
        '0% {',
        vendor + 'animation-timing-function:' + easings.css[a.easeName] + ';',
        '}'
      )

      a.delay && rule.push(
        this.percent(time += a.delay) + '% {',
        vendor +'transform:' + a.item.matrix() + ';',
        '}'
      )

      a.transform(1)

      rule.push(
        this.percent(time += a.duration) + '% {',
        vendor + 'transform:' + a.item.matrix() + ';',
        aNext && aNext.easeName && vendor + 'animation-timing-function:' + easings.css[aNext.easeName] + ';',
        '}'
      )
    } else { // Parallel (it doesn't work with custom easings for now)
      var frames = []
      a.animations.forEach(function(a){
        a.delay && frames.indexOf(a.delay) === -1 && frames.push(a.delay)
        a.duration && frames.indexOf(a.delay + a.duration) === -1 && frames.push(a.delay + a.duration)
      })

      for (var k = 0, m = frames.length; k < m; ++k) {
        var frame = frames[k]
        for (var j = 0, l = a.animations.length; j < l; ++j) {
          var pa = a.animations[j]
          if (pa.delay >= frame || pa.delay + pa.duration < frame) // it's animation start or it's already ended
            continue
          pa.transform((frame - pa.delay) / pa.duration)
        }

        rule.push(
          this.percent(time += frame) + '% {',
          vendor + 'transform:' + a.item.matrix() + ';',
          '}'
        )
      }
    }
  }

  rule.push('}')
  this.stylesheet.insertRule(rule.join(''))
  a.item.dom.style[animationProperty] = animation + ' ' + this.total + 'ms forwards'
  return rule.slice(1, -1).join('')
}
