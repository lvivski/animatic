import { Matrix } from "./math/matrix.js"
import { animationProperty, getProperty, transformProperty } from "./utils.js"
import { buildEffect, containsCssAnimation } from "./waapi/effect.js"

export class CSS {
  /**
   * CSSify animations
  * @param {import("./item.js").Item} item
   * @param {boolean=} idle
   * @constructor
   */
  constructor(item, idle) {
    if (!document.styleSheets.length) {
      this.createStyleSheet()
    }

    this.stylesheet = document.styleSheets[0]

    this.item = item
    this.animation = item.animation

    if (!idle) {
      this.style()
    }
  }

  /**
   * Creates new stylesheet and adds it to HEAD
   */
  createStyleSheet() {
    const style = document.createElement("style")
    document.getElementsByTagName("head")[0].appendChild(style)
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

    this.item.style(animationProperty, "")
    this.item.state = Matrix.decompose(Matrix.parse(transform))
    this.item.style()

    return this
  }

  /**
   * Applies animations and sets item style
   */
  style() {
    if (containsCssAnimation(this.animation)) {
      throw new Error("CSS generation is not supported for named CSS animations")
    }

    const animation = "a" + Date.now() + "r" + Math.floor(Math.random() * 1000)
    const effect = buildEffect(this.animation)

    const cssRules = this.stylesheet.cssRules
    this.stylesheet.insertRule(
      this.keyframes(animation, effect),
      cssRules ? cssRules.length : 0
    )

    this.animation.empty()
    this.animation.add(animation, effect.duration, "", 0, true)
  }

  /**
   * Generates @keyframes based on animations
   * @param {string} name Animation name
   * @param {ReturnType<typeof buildEffect>=} effect
   * @return {string}
   */
  keyframes(name, effect) {
    if (!effect) {
      if (containsCssAnimation(this.animation)) {
        throw new Error(
          "CSS generation is not supported for named CSS animations"
        )
      }
      effect = buildEffect(this.animation)
    }

    const rule = ["@" + getProperty("keyframes") + " " + name + "{"]

    effect.keyframes.forEach((keyframe, index) => {
      rule.push(this.frame(keyframe, index < effect.keyframes.length - 1))
    })

    rule.push("}")
    return rule.join("")
  }

  /**
   * Calcuates percent for keyframes
   * @param {number} offset
   * @return {string}
   */
  percent(offset) {
    return (offset * 100).toFixed(3)
  }

  /**
   * Generates one frame for @keyframes
  * @param {Record<string, string|number|undefined>} keyframe
   * @param {boolean} withEasing
   * @return {string}
   */
  frame(keyframe, withEasing) {
    const percent = this.percent(keyframe.offset || 0)
    const props = []

    for (const property in keyframe) {
      if (property in CSS.skip) continue
      props.push(this.property(property) + ":" + keyframe[property] + ";")
    }

    if (withEasing && keyframe.easing) {
      props.push(
        getProperty("animation-timing-function") + ":" + keyframe.easing + ";"
      )
    }

    return percent + "% {" + props.join("") + "}"
  }

  property(property) {
    return property === transformProperty || property.indexOf("--") === 0
      ? property
      : property.replace(/([A-Z])/g, "-$1").toLowerCase()
  }
}

CSS.skip = {
  offset: null,
  easing: null
}
