function Tween(value) {
	this.value = value
}

Tween.prototype.interpolate = function (end, percent) {
	if (Array.isArray(this.value)) {
		var state = []
		for (var i = 0; i < 3; ++i) {
			if (end && end[i]) {
				state[i] = this.value[i] + end[i] * percent
			} else {
				state[i] = this.value[i]
			}
		}
		return state
	} else if (end !== undefined) {
		return this.value + (end - this.value) * percent
	}
}


