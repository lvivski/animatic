/**
 * Anima
 * @type {Object}
 */
var anima = window.anima = {}

/**
 * Creates and initializes world
 * @return {World}
 */
anima.init = function () {
  return new World(true)
}
