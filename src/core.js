/**
 * Anima
 * @type {Object}
 */
var a = window.anima = window.a = {}

/**
 * Creates and initializes world with frame loop
 * @return {World}
 */
a.js = function js() {
  return new World(true)
}

/**
 * Creates and initializes world without frame loop
 * @return {World}
 */
a.css = function css() {
  return new World
}

/**
 * Creates and initializes timeline
 * @return {Timeline}
 */
a.timeline = function timeline() {
  return new Timeline
}
