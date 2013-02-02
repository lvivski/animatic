var fn = {
  Quad: function (p) {
    return Math.pow(p, 2)
  },
  Cubic: function (p) {
    return Math.pow(p, 2)
  },
  Quart: function (p) {
    return Math.pow(p, 4)
  },
  Quint: function (p) {
    return Math.pow(p, 5)
  },
  Expo: function (p) {
    return Math.pow(p, 6)
  },
	Sine: function (p) {
		return 1 - Math.cos(p * Math.PI / 2)
	},
	Circ: function (p) {
		return 1 - Math.sqrt(1 - p * p)
	},
	Back: function (p) {
		return p * p * (3 * p - 2)
	}
}

var easings = {
  linear: function(p) { return p }
}

Object.keys(fn).forEach(function(name){
  var easeIn = fn[name]
	easings['easeIn' + name] = easeIn
	easings['easeOut' + name] = function (p) {
		return 1 - easeIn(1 - p)
	}
	easings['easeInOut' + name] = function (p) {
		return p < 0.5
      ? easeIn(p * 2) / 2
      : 1 - easeIn(p * -2 + 2) / 2
	}
})