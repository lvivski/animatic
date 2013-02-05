var radians = Math.PI / 180

var Matrix = {
  id: function id() {
    return [1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1]
  },
  multiply: function multiply(a, b) { // doesn't work for perspective
    var c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
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
      : multiply.apply(null, [c].concat(Array.prototype.slice.call(arguments, 2)))
  },
  translate: function translate(tx, ty, tz) {
    if (!(tx || ty || tz)) return Matrix.id()
    
    tx || (tx = 0)
    ty || (ty = 0)
    tz || (tz = 0)

    return [1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1]
  },
  translateX: function translateX(t) {
    return this.translate(t, 0, 0)
  },
  translateY: function translateY(t) {
    return this.translate(0, t, 0)
  },
  translateZ: function translateZ(t) {
    return this.translate(0, 0, t)
  },
  scale: function scale(sx, sy, sz) {
    if (!(sx || sy || sz)) return Matrix.id()
    
    sx || (sx = 1)
    sy || (sy = 1)
    sz || (sz = 1)
    return [sx, 0, 0, 0,
      0, sy, 0, 0,
      0, 0, sz, 0,
      0, 0, 0, 1]
  },
  scaleX: function scaleX(s) {
    return this.scale(s, 0, 0)
  },
  scaleY: function scaleY(s) {
    return this.scale(0, s, 0)
  },
  scaleZ: function scaleZ(s) {
    return this.scale(0, 0, s)
  },
  rotate: function rotate(ax, ay, az) {
    if (!(ax || ay || az)) return Matrix.id()
    
    ax || (ax = 0)
    ay || (ay = 0)
    az || (az = 0)
    
    ax *= radians
    ay *= radians
    az *= radians

    var sx = Math.sin(ax),
        cx = Math.cos(ax),

        sy = Math.sin(ay),
        cy = Math.cos(ay),

        sz = Math.sin(az),
        cz = Math.cos(az)

    return [cy*cz, cx*sz+sx*sy*cz, sx*sz-cx*sy*cz, 0,
      -cy*sz, cx*cz-sx*sy*sz, sx*cz+cx*sy*sz, 0,
      sy, -sx*cy, cx*cy, 0,
      0, 0, 0, 1]
  },
  rotateX: function rotateX(a) {
    a *= radians

    var s = Math.sin(a),
        c = Math.cos(a)

    return [1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1]
  },
  rotateY: function rotateY(a) {
    a *= radians

    var s = Math.sin(a),
        c = Math.cos(a)

    return [c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1]
  },
  rotateZ: function rotateZ(a) {
    a *= radians

    var s = Math.sin(a),
        c = Math.cos(a)

    return [c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1]
  },
  rotate3d: function rotate3d(x, y, z, a) {
    a *= radians

    var s = Math.sin(a),
        c = Math.cos(a),
        len = Math.sqrt(x*x + y*y + z*z)

    if (len === 0) {
      x = 0
      y = 0
      z = 1
    } else if (len !== 1) {
      x /= len
      y /= len
      z /= len
    }

    var xx = x*x,
        yy = y*y,
        zz = z*z,
        _c = 1-c

    return [xx+(1-xx)*c, x*y*_c+z*s, x*z*_c-y*s, 0,
      x*y*_c-z*s, yy+(1-yy)*c, y*z*_c+x*s, 0,
      x*z*_c+y*s, y*z*_c-x*s, zz+(1-zz)*c, 0,
      0, 0, 0, 1]
  },
  skew: function skew(ax, ay) {
    ax *= radians
    ay *= radians

    return [1, Math.tan(ay), 0, 0,
      Math.tan(ax), 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1]
  },
  skewX: function skewX(a) {
    return this.skew(a, 0)
  },
  skewY: function skewY(a) {
    return this.skew(0, a)
  },
  perspective: function perspective(p) {
    p = -1/p
    return [1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, p,
      0, 0, 0, 1]
  },
  toString: function toString(m) {
    for (var i = 0, l = m.length; i < l; ++i)
      if (Math.abs(m[i]) < 1e-6) m[i] = 0
    return "matrix3d(" + m.join() + ")"
  },
  toTestString: function toTestString(m) {
    function clamp(n) {
     return n.toFixed(6);
    }
    function isAffine(m) {
      return m[2] === 0 &&
        m[3] === 0 &&
        m[6] === 0 &&
        m[7] === 0 &&
        m[8] === 0 &&
        m[9] === 0 &&
        m[10] === 1 &&
        m[11] === 0 &&
        m[14] === 0 &&
        m[15] === 1
    }
    function filterAffine(_, i) {
      return [0,1,4,5,12,13].indexOf(i) !== -1
    }
    if (isAffine(m)) {
      return 'matrix(' + m.filter(filterAffine).map(clamp).join(', ') + ')'
    }
    return 'matrix3d(' + m.map(clamp).join(', ') + ')'
  }
}
