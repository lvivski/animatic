var sin = Math.sin,
    cos = Math.cos,
    tan = Math.tan,
    sqrt = Math.sqrt,
    abs = Math.abs,
    round = Math.round,
    pi = Math.PI,
    slice = Array.prototype.slice

function rad(d) {
  return d ? d * pi / 180 : 0
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

function id() {
  return [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1]
}

function multiply(a, b) { // doesn't work for perspective
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
    : multiply.apply(null, [c].concat(slice.call(arguments, 2)))
}

function translate(tx, ty, tz) {
  tx || (tx = 0)
  ty || (ty = 0)
  tz || (tz = 0)

  return [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    tx, ty, tz, 1]
}

function translateX(t) {
  return translate(t, 0, 0)
}

function translateY(t) {
  return translate(0, t, 0)
}

function translateZ(t) {
  return translate(0, 0, t)
}

function scale(sx, sy, sz) {
  sx || (sx = 0)
  sy || (sy = sx)
  sz || (sz = 1)
  return [sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1]
}

function scaleX(s) {
  return scale(s, 0, 0)
}

function scaleY(s) {
  return scale(0, s, 0)
}

function scaleZ(s) {
  return scale(0, 0, s)
}

function rotate(ax, ay, az) {
  ax = rad(ax)
  ay = rad(ay)
  az = rad(az)

  var sx = sin(ax),
      cx = cos(ax),

      sy = sin(ay),
      cy = cos(ay),

      sz = sin(az),
      cz = cos(az)

  return [cy*cz, cx*sz+sx*sy*cz, sx*sz-cx*sy*cz, 0,
    -cy*sz, cx*cz-sx*sy*sz, sx*cz+cx*sy*sz, 0,
    sy, -sx*cy, cx*cy, 0,
    0, 0, 0, 1]
}

function rotateX(a) {
  a = rad(a)

  var s = sin(a),
      c = cos(a)

  return [1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1]
}

function rotateY(a) {
  a = rad(a)

  var s = sin(a),
      c = cos(a)

  return [c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1]
}

function rotateZ(a) {
  a = rad(a)

  var s = sin(a),
      c = cos(a)

  return [c, s, 0, 0,
    -s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1]
}

function rotate3d(x, y, z, a) {
  a = rad(a)

  var s = sin(a),
      c = cos(a),
      len = sqrt(x*x + y*y + z*z)

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
}

function skew(ax, ay) {
  ax = rad(ax)
  ay = rad(ay)

  return [1, tan(ay), 0, 0,
    tan(ax), 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1]
}

function skewX(a) {
  return skew(a, 0)
}

function skewY(a) {
  return skew(0, a)
}

function perspective(p) {
  p = -1/p
  return [1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, p,
    0, 0, 0, 1]
}

function clamp(n) {
  return round(n * 1000000) / 1000000;
}

function filterAffine(_, i) {
  return [0,1,4,5,12,13].indexOf(i) !== -1
}

function matrix(m) {
  if (isAffine(m)) {
    return 'matrix(' + m.filter(filterAffine).map(clamp).join(', ') + ')'
  }
  return 'matrix3d(' + m.map(clamp).join(', ') + ')'
}

