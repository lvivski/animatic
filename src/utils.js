/**
 * Vendor specific stuff
 */

var requestAnimationFrame = window.requestAnimationFrame,
	cancelAnimationFrame = window.cancelAnimationFrame,
	vendors = ['moz', 'webkit', 'ms'],
	i = vendors.length

while (--i < vendors.length && !requestAnimationFrame) {
	requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame']
	cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame']
	                     || window[vendors[i] + 'CancelRequestAnimationFrame']
}

var prefix = ([].slice.call(getComputedStyle(document.documentElement, null))
    	.join('').match(/(-(moz|webkit|ms)-)transform/) || [])[1],
    transformProperty = getProperty('transform'),
    animationProperty = getProperty('animation')

function getProperty(name) {
	return prefix ? prefix + name : name
}
