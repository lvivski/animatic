var easings = (function(){
  var fn = {
    quad: function (p) {
      return Math.pow(p, 2)
    },
    cubic: function (p) {
      return Math.pow(p, 2)
    },
    quart: function (p) {
      return Math.pow(p, 4)
    },
    quint: function (p) {
      return Math.pow(p, 5)
    },
    expo: function (p) {
      return Math.pow(p, 6)
    },
  	sine: function (p) {
  		return 1 - Math.cos(p * Math.PI / 2)
  	},
  	circ: function (p) {
  		return 1 - Math.sqrt(1 - p * p)
  	},
  	back: function (p) {
  		return p * p * (3 * p - 2)
  	}
  }

  var easings = {
    linear: function(p) { return p }
  }

  Object.keys(fn).forEach(function(name){
    var ease = fn[name]
  	easings['ease-in-' + name] = ease
  	easings['ease-out-' + name] = function (p) {
  		return 1 - ease(1 - p)
  	}
  	easings['ease-in-out-' + name] = function (p) {
  		return p < 0.5
        ? ease(p * 2) / 2
        : 1 - ease(p * -2 + 2) / 2
  	}
  })
  
  return easings
}())
