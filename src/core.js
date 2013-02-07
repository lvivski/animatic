/**
 * Anima
 * @type {Object}
 */
var anima = window.anima = {}

/**
 * Creates and initializes world with frame loop
 * @return {World}
 */
anima.js = function () {
  return new World(true)
}

/**
 * Creates and initializes world without frame loop
 * @return {World}
 */
anima.css = function () {
  return new World()
}

