var Vector = {
	set: function (x, y, z) {
		if (Array.isArray(x)) {
			y = x[1]
			z = x[2]
			x = x[0]
		}
		if (x === undefined) {
			x = 0
		}
		if (y === undefined) {
			y = x
			z = x
		}
		return [x, y, z]
	},
	length: function (x, y, z) {
		if (Array.isArray(x)) {
			y = x[1]
			z = x[2]
			x = x[0]
		}
		return Math.sqrt(x * x + y * y + z * z)
	},
	add: function (a, b) {
		return [
			a[0] + b[0],
			a[1] + b[1],
			a[2] + b[2]
		]
	},
	sub: function (a, b) {
		return [
			a[0] - b[0],
			a[1] - b[1],
			a[2] - b[2]
		]
	},
	norm: function (x, y, z) {
		if (Array.isArray(x)) {
			y = x[1]
			z = x[2]
			x = x[0]
		}
		var len = this.length(x, y, z)

		if (len !== 0) {
			x /= len
			y /= len
			z /= len
		} else {
			x = 0
			y = 0
			z = 0
		}

		return [x, y, z]
	},
	dist: function (a, b) {
		var dx = a[0] - b[0],
			dy = a[1] - b[1],
			dz = a[2] - b[2]

		return Math.sqrt(dx * dx + dy * dy + dz + dz)
	},
	cross: function (a, b) {
		var x = a[1] * b[2] - a[2] * b[1],
			y = a[2] * b[0] - a[0] * b[2],
			z = a[1] * b[1] - a[1] * b[0]

		return [x, y, z]
	},
	clone: function (v) {
		return v.slice()
	},
	scale: function (x, y, z, f) {
		if (Array.isArray(x)) {
			f = y
			y = x[1]
			z = x[2]
			x = x[0]
		}
		return [x * f, y * f, z * f]
	},
	zero: function () {
		return [0, 0, 0]
	}
}
