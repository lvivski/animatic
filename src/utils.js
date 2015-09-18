/**
 * Vendor specific stuff
 */

var requestAnimationFrame = root.requestAnimationFrame,
    cancelAnimationFrame = root.cancelAnimationFrame,
    vendors = ['moz', 'webkit', 'ms']

for (var i = 0; i < vendors.length && !requestAnimationFrame; i++) {
	requestAnimationFrame = root[vendors[i] + 'RequestAnimationFrame']
	cancelAnimationFrame = root[vendors[i] + 'CancelAnimationFrame']
						|| root[vendors[i] + 'CancelRequestAnimationFrame']
}

var prefix = ([].slice.call(getComputedStyle(document.documentElement, null))
    	.join('').match(/(-(moz|webkit|ms)-)transform/) || [])[1],
    transformProperty = getProperty('transform'),
    animationProperty = getProperty('animation'),
    fixTick

function getProperty(name) {
	return prefix ? prefix + name : name
}

var performance = root.performance && root.performance.now ? root.performance : Date

requestAnimationFrame(function(tick) {
	fixTick = tick > 1e12 != performance.now() > 1e12
})
