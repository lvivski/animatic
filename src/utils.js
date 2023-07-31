/**
 * Vendor specific stuff
 */

export const prefix = ([].slice.call(getComputedStyle(document.documentElement, null))
  .join('').match(/(-(moz|webkit|ms)-)transform/) || [])[1]
export const transformProperty = getProperty('transform')
export const animationProperty = getProperty('animation')
export let fixTick

export function getProperty(name) {
  return name
}

requestAnimationFrame(function(tick) {
	fixTick = tick > 1e12 != performance.now() > 1e12
})

export function merge(obj) {
  let i = 1
	while (i < arguments.length) {
    const source = arguments[i++]
    for (const property in source) {
			if (Array.isArray(source[property])) {
        for (let j = 0; j < source[property].length; ++j) {
          const value = source[property][j]
					if (value) {
						obj[property][j] = value
					}
				}
			} else {
				obj[property] = source[property]
			}
		}
	}
	return obj
}
