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
  var animation = '"a' + (Date.now() + Math.floor(Math.random() * 100)) + '"'
  var rule = ['@-webkit-keyframes ' + animation + '{']

  var time = 0

  for (var i = 0, len = this.animations.length; i < len; i++) {
    var a = this.animations[i]
    a.init()
    if (a.delay) {
      rule.push(
        this.percent(time += a.delay) + '% {',
        '-webkit-transform:' + a.item.matrix() + ';',
        '-webkit-animation-timing-function:' + a.easeName + ';',
        '}'
      )
    }
    a.transform(1)
    rule.push(
      this.percent(time += a.duration) + '% {',
      '-webkit-transform:' + a.item.matrix() + ';',
      '-webkit-animation-timing-function:' + a.easeName + ';',
      '}'
    )
  }
  rule.push('}')
  this.stylesheet.insertRule(rule.join(''))
  a.item.dom.style.WebkitAnimation = animation + ' ' + this.total + 'ms forwards'
  console.log(a.item.dom.style)
}
