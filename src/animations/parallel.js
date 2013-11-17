/**
 * Creates a set of parallel animations
 * @param {Item} item
 * @constructor
 */
function Parallel(item) {
	Collection.call(this, item)
}

Parallel.prototype = Object.create(Collection.prototype)
Parallel.prototype.constructor = Parallel

/**
 * Calls a method on all animations
 * @param {string} method
 */
Parallel.prototype.all = function (method) {
	var args = Array.prototype.slice.call(arguments, 1)

	for (var i = 0; i < this.animations.length; ++i) {
		var a = this.animations[i]
		a[method].apply(a, args)
	}
}

/**
 * Initializes all animations in a set
 * @param {number} tick
 * @param {boolean=} force Force initialization
 * @fires Parallel#start
 */
Parallel.prototype.init = function (tick, force) {
	if (this.start !== null && !force) return
	this.start = tick
	this.all('init', tick, force)
	this.emit('start')
}

/**
 * Runs one tick of animations
 * @param {number} tick
 */
Parallel.prototype.run = function (tick) {
	if (!this.animations.length) return

	for (var i = 0; i < this.animations.length; ++i) {
		var a = this.animations[i]
		if (a.start + a.duration <= tick) {
			this.animations.splice(i--, 1)
			a.end()
			continue
		}
		a.run(tick)
	}
	this.item.style()

	if (!this.animations.length) {
		this.end()
	}
}

/**
 * Seeks to the animation tick
 * @param {number} tick
 */
Parallel.prototype.seek = function (tick) {
	this.run(tick)
}

/**
 * Pauses animations
 */
Parallel.prototype.pause = function () {
	this.all('pause')
}

/**
 * Resumes animations
 */
Parallel.prototype.resume = function () {
	this.all('resume')
}

/**
 * Ends all animations in a set
 * @param {boolean} abort
 * @fires Parallel#end
 */
Parallel.prototype.end = function (abort) {
	this.all('end', abort)
	this.emit('end')
}
