/**
 * Anima
 * @type {Object}
 */
var a = window.anima = window.a = {}

/**
 * Creates and initializes world with frame loop
 * @return {World}
 */
a.world = function () {
  return new World(true)
}

/**
 * Creates and initializes timeline
 * @return {Timeline}
 */
a.timeline = function () {
  return new Timeline
}
