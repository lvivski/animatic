export const Vector = {
	/**
	 * @param {number|Array<number>=} x
	 * @param {number=} y
	 * @param {number=} z
	 * @returns {Array<number>}
	 */
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
	/**
	 * @param {number|Array<number>} x
	 * @param {number=} y
	 * @param {number=} z
	 * @returns {number}
	 */
  length(x, y, z) {
		if (Array.isArray(x)) {
			y = x[1]
			z = x[2]
			x = x[0]
		}
		return Math.sqrt(x * x + y * y + z * z)
	},
	/**
	 * @param {Array<number>} a
	 * @param {Array<number>} b
	 * @returns {Array<number>}
	 */
  add(a, b) {
		return [
			a[0] + b[0],
			a[1] + b[1],
			a[2] + b[2]
		]
	},
	/**
	 * @param {Array<number>} a
	 * @param {Array<number>} b
	 * @returns {Array<number>}
	 */
  sub(a, b) {
		return [
			a[0] - b[0],
			a[1] - b[1],
			a[2] - b[2]
		]
	},
	/**
	 * @param {number|Array<number>} x
	 * @param {number=} y
	 * @param {number=} z
	 * @returns {Array<number>}
	 */
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
	/**
	 * @param {Array<number>} a
	 * @param {Array<number>} b
	 * @returns {number}
	 */
  dist(a, b) {
    const dx = a[0] - b[0]
    const dy = a[1] - b[1]
    const dz = a[2] - b[2]

		return Math.sqrt(dx * dx + dy * dy + dz * dz)
	},
	/**
	 * @param {Array<number>} a
	 * @param {Array<number>} b
	 * @returns {Array<number>}
	 */
  cross(a, b) {
    const x = a[1] * b[2] - a[2] * b[1]
    const y = a[2] * b[0] - a[0] * b[2]
		const z = a[0] * b[1] - a[1] * b[0]

		return [x, y, z]
	},
	/**
	 * @param {Array<number>} v
	 * @returns {Array<number>}
	 */
  clone(v) {
		return v.slice()
	},
	/**
	 * @param {number|Array<number>} x
	 * @param {number=} y
	 * @param {number=} z
	 * @param {number=} f
	 * @returns {Array<number>}
	 */
  scale(x, y, z, f) {
		if (Array.isArray(x)) {
			f = y
			y = x[1]
			z = x[2]
			x = x[0]
		}
		return [x * f, y * f, z * f]
	},
	/**
	 * @returns {Array<number>}
	 */
  zero() {
		return [0, 0, 0]
	}
}
