/**
 * Vendor specific stuff
 */

var requestAnimationFrame = top.requestAnimationFrame,
    cancelAnimationFrame = top.cancelAnimationFrame,
    vendors = ['moz', 'webkit', 'ms']

for (var i = 0; i < vendors.length && !requestAnimationFrame; i++) {
	requestAnimationFrame = top[vendors[i] + 'RequestAnimationFrame']
	cancelAnimationFrame = top[vendors[i] + 'CancelAnimationFrame']
	                     || top[vendors[i] + 'CancelRequestAnimationFrame']
}

var prefix = ([].slice.call(getComputedStyle(document.documentElement, null))
    	.join('').match(/(-(moz|webkit|ms)-)transform/) || [])[1],
    transformProperty = getProperty('transform'),
    animationProperty = getProperty('animation'),
    fixTick

function getProperty(name) {
	return prefix ? prefix + name : name
}

var performance = top.performance && top.performance.now ? top.performance : Date

requestAnimationFrame(function(tick) {
	fixTick = tick > 1e12 != performance.now() > 1e12
})


