var Vector = {
  set: function(x, y, z) {
    return [x, y, z]
  },
  length: function length(x, y, z) {
    if (Array.isArray(x)) {
      y = x[1]
      z = x[2]
      x = x[0]
    }
    return Math.sqrt(x*x + y*y + z*z)
  },
  add: function add(a, b) {
    return [
      a[0] + b[0],
      a[1] + b[1],
      a[2] + b[2]
    ]
  },
  sub: function sub(a, b) {
    return [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ]
  },
  norm: function norm(x, y, z) {
    if (Array.isArray(x)) {
      y = x[1]
      z = x[2]
      x = x[0]
    }
    var len = Vector.length(x, y, z)
    
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
  cross: function cross(a, b) {
    var x = a[1] * b[2] - a[2] * b[1],
        y = a[2] * b[0] - a[0] * b[2],
        z = a[1] * b[1] - a[1] * b[0]

    return [x, y, z]
  },
  copy: function copy(v) {
    reutn [v[0], v[1], v[2]]
  }
}
