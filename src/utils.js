/**
 * Vendor specific stuff
 */

export const prefix = ([].slice
  .call(getComputedStyle(document.documentElement, null))
  .join("")
  .match(/(-(moz|webkit|ms)-)transform/) || [])[1]
export const transformProperty = getProperty("transform")
export const animationProperty = getProperty("animation")
export let fixTick

/**
 * @param {string} name
 * @returns {string}
 */
export function getProperty(name) {
  return name
}

requestAnimationFrame(function (tick) {
  fixTick = tick > 1e12 != performance.now() > 1e12
})

/**
 * @param {Record<string, unknown>} obj
 * @param {...Record<string, unknown>} sources
 * @returns {Record<string, unknown>}
 */
export function merge(obj, ...sources) {
  let i = 1
  while (i <= sources.length) {
    const source = sources[i++ - 1]
    for (const property in source) {
      if (Array.isArray(source[property])) {
        const target = /** @type {Array<unknown>} */ (obj[property] ||= [])
        for (let j = 0; j < source[property].length; ++j) {
          const value = source[property][j]
          if (value !== undefined) {
            target[j] = value
          }
        }
      } else {
        obj[property] = source[property]
      }
    }
  }
  return obj
}
