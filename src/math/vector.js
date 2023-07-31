export const Vector = {
  set(x, y, z) {
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
  length(x, y, z) {
		if (Array.isArray(x)) {
			y = x[1]
			z = x[2]
			x = x[0]
		}
		return Math.sqrt(x * x + y * y + z * z)
	},
  add(a, b) {
		return [
			a[0] + b[0],
			a[1] + b[1],
			a[2] + b[2]
		]
	},
  sub(a, b) {
		return [
			a[0] - b[0],
			a[1] - b[1],
			a[2] - b[2]
		]
	},
  norm(x, y, z) {
		if (Array.isArray(x)) {
			y = x[1]
			z = x[2]
			x = x[0]
		}
    const len = this.length(x, y, z)

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
  dist(a, b) {
    const dx = a[0] - b[0]
    const dy = a[1] - b[1]
    const dz = a[2] - b[2]

		return Math.sqrt(dx * dx + dy * dy + dz + dz)
	},
  cross(a, b) {
    const x = a[1] * b[2] - a[2] * b[1]
    const y = a[2] * b[0] - a[0] * b[2]
    const z = a[1] * b[1] - a[1] * b[0]

		return [x, y, z]
	},
  clone(v) {
		return v.slice()
	},
  scale(x, y, z, f) {
		if (Array.isArray(x)) {
			f = y
			y = x[1]
			z = x[2]
			x = x[0]
		}
		return [x * f, y * f, z * f]
	},
  zero() {
		return [0, 0, 0]
	}
}
