import { Collection } from "./animations/collection.js"
import { easings } from "./animations/easings.js"
import { Item } from "./item.js"
import { Matrix } from "./math/matrix.js"
import { animationProperty, getProperty, transformProperty } from "./utils.js"

export class CSS {
  /**
   * CSSify animations
   * @param {Item} item
   * @param {boolean=} idle
   * @constructor
   */
  constructor(item, idle) {
    !document.styleSheets.length && this.createStyleSheet()
    this.stylesheet = document.styleSheets[0]

    this.item = item
    this.animation = item.animation

    !idle && this.style()
  }

  static skip = { translate: null, rotate: null, scale: null };

  /**
   * Creates new stylesheet and adds it to HEAD
   */
  createStyleSheet() {
    const style = document.createElement('style')
    document.getElementsByTagName('head')[0].appendChild(style)
  }

  /**
   * Pauses CSS animation
   */
  pause() {
    this.animation.pause()
  }

  /**
   * Resumes CSS animation
   */
  resume() {
    this.animation.resume()
  }

  /**
   * Stops CSS animation
   * parses current transformation matrix
   * extracts values and sets item state
   */
  stop() {
    const computed = getComputedStyle(this.item.dom, null),
      transform = computed[transformProperty]

    this.item.style(animationProperty, '')
    this.item.state = Matrix.decompose(Matrix.parse(transform))
    this.item.style()

    return this
  }

  /**
   * Applies animations and sets item style
   */
  style() {
    const animation = 'a' + Date.now() + 'r' + Math.floor(Math.random() * 1000)

    const cssRules = this.stylesheet.cssRules
    this.stylesheet.insertRule(this.keyframes(animation), cssRules ? cssRules.length : 0)

    this.animation.empty()
    this.animation.add(animation, this.animation.duration, '', 0, true)
  }

  /**
   * Generates @keyframes based on animations
   * @param {string} name Animation name
   * @return {string}
   */
  keyframes(name) {
    let time = 0
    const rule = ['@' + getProperty('keyframes') + ' ' + name + '{']

    for (let i = 0; i < this.animation.length; ++i) {
      const a = this.animation.get(i)
      const aNext = this.animation.get(i + 1)

      a.init(time)

      if (a instanceof Animation) { // Single
        i === 0 && rule.push(this.frame(0, easings.css[a.easeName]))

        a.delay && rule.push(this.frame(time += a.delay))

        a.transform(1)

        rule.push(this.frame(time += a.duration, aNext && easings.css[aNext.easeName]))
      } else if (a instanceof Collection) { // Parallel (it doesn't work with custom easings for now)
        let frames = []
        a.animations.forEach(function frame(a) {
          a.animations && a.animations.forEach(frame)
          a.delay && frames.indexOf(a.delay) === -1 && frames.push(a.delay)
          a.duration && frames.indexOf(a.delay + a.duration) === -1 && frames.push(a.delay + a.duration)
        })

        frames = frames.sort(function (a, b) {
          return a - b
        })

        for (let k = 0; k < frames.length; ++k) {
          const frame = frames[k]
          for (let j = 0; j < a.animations.length; ++j) {
            const pa = a.animations[j]
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
  percent(time) {
    return (time * 100 / this.animation.duration).toFixed(3)
  }

  /**
   * Generates one frame for @keyframes
   * @param {number} time
   * @param {string=} ease
   * @return {string}
   */
  frame(time, ease) {
    const percent = this.percent(time)
    const props = []
    for (const property in this.item.state) {
      if (property in CSS.skip) continue
      props.push(percent ? property.replace(/([A-Z])/g, '-$1') + ':' + this.item.get(property) + ';' : '')
    }
    return percent + '% {' +
      (percent ? transformProperty + ':' + this.item.transform() + ';' : '') +
      (props.join('')) +
      (ease ? getProperty('animation-timing-function') + ':' + ease + ';' : '') +
      '}'
  }
}
