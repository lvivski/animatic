import { Vector } from "./vector.js"

const radians = Math.PI / 180

/**
 * Matrix object for transformation calculations
 * @type {Object}
 */
export const Matrix = {
  identity() {
		return [1, 0, 0, 0,
		        0, 1, 0, 0,
		        0, 0, 1, 0,
		        0, 0, 0, 1]
	},
  multiply(a, b) { // doesn't work for perspective
    const c = this.identity()

		c[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8]
		c[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9]
		c[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10]

		c[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8]
		c[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9]
		c[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10]

		c[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8]
		c[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9]
		c[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10]

		c[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + b[12]
		c[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + b[13]
		c[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + b[14]

		return 2 >= arguments.length
			? c
      : this.multiply.apply(this, [c].concat(Array.prototype.slice.call(arguments, 2)))
	},
  translate(tx, ty, tz) {
		if (!(tx || ty || tz)) return this.identity()

    tx ||= 0
    ty ||= 0
    tz ||= 0

		return [1, 0, 0, 0,
		        0, 1, 0, 0,
		        0, 0, 1, 0,
		        tx, ty, tz, 1]
	},
	/*
	translateX(t) {
		return this.translate(t, 0, 0)
	},
	translateY(t) {
		return this.translate(0, t, 0)
	},
	translateZ(t) {
		return this.translate(0, 0, t)
	},
	*/
  scale(sx, sy, sz) {
		if (!(sx || sy || sz)) return this.identity()

    sx ||= 1
    sy ||= 1
    sz ||= 1

		return [sx, 0, 0, 0,
		        0, sy, 0, 0,
		        0, 0, sz, 0,
		        0, 0, 0, 1]
	},
	/*
	scaleX(s) {
		return this.scale(s, 0, 0)
	},
	scaleY(s) {
		return this.scale(0, s, 0)
	},
	scaleZ(s) {
		return this.scale(0, 0, s)
	},
	*/
  rotate(ax, ay, az) {
		if (!(ax || ay || az)) return this.identity()

    ax ||= 0
    ay ||= 0
    az ||= 0

		ax *= radians
		ay *= radians
		az *= radians

    const sx = Math.sin(ax)
    const cx = Math.cos(ax)

    const sy = Math.sin(ay)
    const cy = Math.cos(ay)

    const sz = Math.sin(az)
    const cz = Math.cos(az)

		return [cy * cz, cx * sz + sx * sy * cz, sx * sz - cx * sy * cz, 0,
		       -cy * sz, cx * cz - sx * sy * sz, sx * cz + cx * sy * sz, 0,
		        sy, -sx * cy, cx * cy, 0,
		        0, 0, 0, 1]
	},
	/*
	rotateX(a) {
		a *= radians

		const s = Math.sin(a)
	  const c = Math.cos(a)

		return [1, 0, 0, 0,
		        0, c, s, 0,
		        0, -s, c, 0,
		        0, 0, 0, 1]
		},
	rotateY(a) {
		a *= radians

		const s = Math.sin(a)
		const c = Math.cos(a)

		return [c, 0, -s, 0,
		        0, 1, 0, 0,
		        s, 0, c, 0,
		        0, 0, 0, 1]
	},
	rotateZrotateZ(a) {
		a *= radians

		const s = Math.sin(a)
		const c = Math.cos(a)

	 	return [c, s, 0, 0,
		       -s, c, 0, 0,
		        0, 0, 1, 0,
		        0, 0, 0, 1]
	},
	*/
  rotate3d(x, y, z, a = 0) {
		a *= radians

    const s = Math.sin(a)
    const c = Math.cos(a)
    const norm = Vector.norm(x, y, z)

		x = norm[0]
		y = norm[1]
		z = norm[2]

    const xx = x * x
    const yy = y * y
    const zz = z * z
    const _c = 1 - c

		return [xx + (1 - xx) * c, x * y * _c + z * s, x * z * _c - y * s, 0,
			x * y * _c - z * s, yy + (1 - yy) * c, y * z * _c + x * s, 0,
			x * z * _c + y * s, y * z * _c - x * s, zz + (1 - zz) * c, 0,
			0, 0, 0, 1]
	},
  skew(ax, ay) {
		if (!(ax || ay)) return this.identity()

    ax ||= 0
    ay ||= 0

		ax *= radians
		ay *= radians

		return [1, Math.tan(ay), 0, 0,
			Math.tan(ax), 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1]
	},
	/*
	skewX(a) {
		return this.skew(a, 0)
	},
	skewY(a) {
		return this.skew(0, a)
	},
	*/
  perspective(p) {
		p = -1 / p

		return [1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, p,
			0, 0, 0, 1]
	},
  parse(s) {
    const m = s.match(/\((.+)\)/)[1].split(/,\s?/)
		if (m.length === 6) {
			m.splice(2, 0, 0, 0)
			m.splice(6, 0, 0, 0)
			m.splice(8, 0, 0, 0, 1, 0)
			m.push(0, 1)
		}

		return m
	},
  inverse(m) {
    const a = this.identity()

    const inv0 = m[5] * m[10] - m[6] * m[9]
    const inv1 = m[1] * m[10] - m[2] * m[9]
    const inv2 = m[1] * m[6] - m[2] * m[5]

    const inv4 = m[4] * m[10] - m[6] * m[8]
    const inv5 = m[0] * m[10] - m[2] * m[8]
    const inv6 = m[0] * m[6] - m[2] * m[4]

    const inv8 = m[4] * m[9] - m[5] * m[8]
    const inv9 = m[0] * m[9] - m[1] * m[8]
    const inv10 = m[0] * m[5] - m[1] * m[4]

    const det = 1 / (m[0] * inv0 - m[1] * inv4 + m[2] * inv8)

		a[0] = det * inv0
		a[1] = -det * inv1
		a[2] = det * inv2

		a[4] = -det * inv4
		a[5] = det * inv5
		a[6] = -det * inv6

		a[8] = det * inv8
		a[9] = -det * inv9
		a[10] = det * inv10

		a[12] = -m[12] * a[0] - m[13] * a[4] - m[14] * a[8]
		a[13] = -m[12] * a[1] - m[13] * a[5] - m[14] * a[9]
		a[14] = -m[12] * a[2] - m[13] * a[6] - m[14] * a[10]

		return a
	},
  compose(translate = [], rotate = [], scale = []) {
    const a = this.rotate(rotate[0], rotate[1], rotate[2])

		if (scale.length) {
			a[0] *= scale[0]
			a[1] *= scale[0]
			a[2] *= scale[0]

			a[4] *= scale[1]
			a[5] *= scale[1]
			a[6] *= scale[1]

			a[8] *= scale[2]
			a[9] *= scale[2]
			a[10] *= scale[2]
		}

		if (translate.length) {
			a[12] = translate[0]
			a[13] = translate[1]
			a[14] = translate[2]
		}

		return a
	},
  decompose(m) { // supports only scale*rotate*translate matrix
    const sX = Vector.length(m[0], m[1], m[2])
    const sY = Vector.length(m[4], m[5], m[6])
    const sZ = Vector.length(m[8], m[9], m[10])

    let rX = Math.atan2(-m[9] / sZ, m[10] / sZ) / radians
    let rY = Math.asin(m[8] / sZ) / radians
    let rZ = Math.atan2(-m[4] / sY, m[0] / sX) / radians

		if (m[4] === 1 || m[4] === -1) {
			rX = 0
			rY = m[4] * -Math.PI / 2
			rZ = m[4] * Math.atan2(m[6] / sY, m[5] / sY) / radians
		}

    const tX = m[12]
    const tY = m[13]
    const tZ = m[14]

		return {
			translate: [tX, tY, tZ],
			rotate: [rX, rY, rZ],
			scale: [sX, sY, sZ]
		}
	},
  transpose(m) {
    let t

		t = m[1]
		m[1] = m[4]
		m[4] = t

		t = m[2]
		m[2] = m[8]
		m[8] = t

		t = m[6]
		m[6] = m[9]
		m[9] = t

		t = m[3]
		m[3] = m[12]
		m[12] = t

		t = m[7]
		m[7] = m[13]
		m[13] = t

		t = m[11]
		m[11] = m[14]
		m[14] = t

		return m
	},
  lookAt(eye, target, up) {
    let z = Vector.sub(eye, target)
		z = Vector.norm(z)
		if (Vector.length(z) === 0)
			z[2] = 1

    let x = Vector.cross(up, z)
		if (Vector.length(x) === 0) {
			z[0] += 0.0001
			x = Vector.norm(Vector.cross(up, z))
		}

    const y = Vector.cross(z, x)

    const a = this.identity()

		a[0] = x[0]
		a[1] = x[1]
		a[2] = x[2]

		a[4] = y[0]
		a[5] = y[1]
		a[6] = y[2]

		a[8] = z[0]
		a[9] = z[1]
		a[10] = z[2]

		return a
	},
  stringify(m) {
    for (let i = 0; i < m.length; ++i) {
			if (Math.abs(m[i]) < 1e-5) m[i] = 0
		}
		return 'matrix3d(' + m.join() + ')'
	}
}
