/**
 * CSSify animations
 * @param {Item} item
 * @param {boolean=} idle
 * @constructor
 */
function CSS(item, idle) {
	!document.styleSheets.length && this.createStyleSheet()
	this.stylesheet = document.styleSheets[0]

	this.item = item
	this.animation = item.animation

	!idle && this.style()
}

CSS.skip = {translate: null, rotate: null, scale: null};

/**
 * Creates new stylesheet and adds it to HEAD
 */
CSS.prototype.createStyleSheet = function () {
	var style = document.createElement('style')
	document.getElementsByTagName('head')[0].appendChild(style)
}

/**
 * Pauses CSS animation
 */
CSS.prototype.pause = function () {
	this.animation.pause()
}

/**
 * Resumes CSS animation
 */
CSS.prototype.resume = function () {
	this.animation.resume()
}

/**
 * Stops CSS animation
 * parses current transformation matrix
 * extracts values and sets item state
 */
CSS.prototype.stop = function () {
	var computed = getComputedStyle(this.item.dom, null),
		transform = computed[transformProperty]

	this.item.style(animationProperty, '')
	this.item.state = Matrix.decompose(Matrix.parse(transform))
	this.item.style()

	return this
}

/**
 * Applies animations and sets item style
 */
CSS.prototype.style = function () {
	var animation = 'a' + Date.now() + 'r' + Math.floor(Math.random() * 1000)

	var cssRules = this.stylesheet.cssRules
	this.stylesheet.insertRule(this.keyframes(animation), cssRules ? cssRules.length : 0)

	this.animation.empty()
	this.animation.add(animation, this.animation.duration, '', 0, true)
}

/**
 * Generates @keyframes based on animations
 * @param {string} name Animation name
 * @return {string}
 */
CSS.prototype.keyframes = function (name) {
	var time = 0,
		rule = ['@' + getProperty('keyframes') + ' ' + name + '{']

	for (var i = 0; i < this.animation.length; ++i) {
		var a = this.animation.get(i),
		    aNext = this.animation.get(i + 1)

		a.init()

		if (a instanceof Animation) { // Single
			i === 0 && rule.push(this.frame(0, easings.css[a.easeName]))

			a.delay && rule.push(this.frame(time += a.delay))

			a.transform(1)

			rule.push(this.frame(time += a.duration, aNext && easings.css[aNext.easeName]))
		} else { // Parallel (it doesn't work with custom easings for now)
			var frames = []
			a.animations.forEach(function frame(a) {
				a.animations && a.animations.forEach(frame)
				a.delay && frames.indexOf(a.delay) === -1 && frames.push(a.delay)
				a.duration && frames.indexOf(a.delay + a.duration) === -1 && frames.push(a.delay + a.duration)
			})

			frames = frames.sort(function (a, b) {
				return a - b
			})

			for (var k = 0; k < frames.length; ++k) {
				var frame = frames[k]
				for (var j = 0; j < a.animations.length; ++j) {
					var pa = a.animations[j]
					// it's animation start or it's already ended
					if (pa.delay >= frame || pa.delay + pa.duration < frame)
						continue
					pa.transform(pa.ease((frame - pa.delay) / pa.duration))
				}

				rule.push(this.frame(time += frame))
			}
		}
	}
	rule.push('}')
	return rule.join('')
}

/**
 * Calcuates percent for keyframes
 * @param {number} time
 * @return {string}
 */
CSS.prototype.percent = function (time) {
	return (time * 100 / this.animation.duration).toFixed(3)
}

/**
 * Generates one frame for @keyframes
 * @param {number} time
 * @param {string=} ease
 * @return {string}
 */
CSS.prototype.frame = function (time, ease) {
	var percent = this.percent(time),
		props = []
	for (var property in this.item.state) {
		if (property in CSS.skip) continue
		props.push(percent ? property.replace(/([A-Z])/g, '-$1') + ':' + this.item.get(property) + ';' : '')
	}
	return percent + '% {' +
		(percent ? transformProperty + ':' + this.item.transform() + ';' : '') +
		(props.join('')) +
		(ease ? getProperty('animation-timing-function') + ':' + ease + ';' : '') +
		'}'
}
