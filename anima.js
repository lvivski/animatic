(function() {
  var a = window.anima = window.a = {};
  a.js = function() {
    return new World(true);
  };
  a.css = function() {
    return new World();
  };
  var vendors = [ "webkit", "Moz", "O", "ms" ], i = 0, _requestAnimationFrame = window.requestAnimationFrame, _cancelAnimationFrame = window.cancelAnimationFrame;
  while (!_requestAnimationFrame && i < vendors.length) {
    var vendor = vendors[i++].toLowerCase();
    _requestAnimationFrame = window[vendor + "RequestAnimationFrame"];
    _cancelAnimationFrame = window[vendor + "CancelAnimationFrame"] || window[vendor + "CancelRequestAnimationFrame"];
  }
  if (window.chrome && !vendor) vendor = vendors[0];
  var _vendor = vendor ? "-" + vendor + "-" : "", _transformProperty = getProperty("transform"), _animationProperty = getProperty("animation"), _transitionProperty = getProperty("transition");
  function getProperty(property) {
    var style = document.createElement("div").style, Property = property[0].toUpperCase() + property.slice(1);
    if (typeof style.transform === "undefined") {
      return vendors.filter(function(vendor) {
        return typeof style[vendor + Property] !== "undefined";
      })[0] + Property;
    } else {
      return property;
    }
  }
  var easings = function() {
    var fn = {
      quad: function(p) {
        return Math.pow(p, 2);
      },
      cubic: function(p) {
        return Math.pow(p, 3);
      },
      quart: function(p) {
        return Math.pow(p, 4);
      },
      quint: function(p) {
        return Math.pow(p, 5);
      },
      expo: function(p) {
        return Math.pow(p, 6);
      },
      sine: function(p) {
        return 1 - Math.cos(p * Math.PI / 2);
      },
      circ: function(p) {
        return 1 - Math.sqrt(1 - p * p);
      },
      back: function(p) {
        return p * p * (3 * p - 2);
      }
    };
    var easings = {
      linear: function(p) {
        return p;
      }
    };
    Object.keys(fn).forEach(function(name) {
      var ease = fn[name];
      easings["ease-in-" + name] = ease;
      easings["ease-out-" + name] = function(p) {
        return 1 - ease(1 - p);
      };
      easings["ease-in-out-" + name] = function(p) {
        return p < .5 ? ease(p * 2) / 2 : 1 - ease(p * -2 + 2) / 2;
      };
    });
    easings.css = {
      linear: "cubic-bezier(0.000, 0.000, 1.000, 1.000)",
      "ease-in-quad": "cubic-bezier(0.550, 0.085, 0.680, 0.530)",
      "ease-in-cubic": "cubic-bezier(0.550, 0.055, 0.675, 0.190)",
      "ease-in-quart": "cubic-bezier(0.895, 0.030, 0.685, 0.220)",
      "ease-in-quint": "cubic-bezier(0.755, 0.050, 0.855, 0.060)",
      "ease-in-sine": "cubic-bezier(0.470, 0.000, 0.745, 0.715)",
      "ease-in-expo": "cubic-bezier(0.950, 0.050, 0.795, 0.035)",
      "ease-in-circ": "cubic-bezier(0.600, 0.040, 0.980, 0.335)",
      "ease-in-back": "cubic-bezier(0.600, -0.280, 0.735, 0.045)",
      "ease-out-quad": "cubic-bezier(0.250, 0.460, 0.450, 0.940)",
      "ease-out-cubic": "cubic-bezier(0.215, 0.610, 0.355, 1.000)",
      "ease-out-quart": "cubic-bezier(0.165, 0.840, 0.440, 1.000)",
      "ease-out-quint": "cubic-bezier(0.230, 1.000, 0.320, 1.000)",
      "ease-out-sine": "cubic-bezier(0.390, 0.575, 0.565, 1.000)",
      "ease-out-expo": "cubic-bezier(0.190, 1.000, 0.220, 1.000)",
      "ease-out-circ": "cubic-bezier(0.075, 0.820, 0.165, 1.000)",
      "ease-out-back": "cubic-bezier(0.175, 0.885, 0.320, 1.275)",
      "ease-in-out-quad": "cubic-bezier(0.455, 0.030, 0.515, 0.955)",
      "ease-in-out-cubic": "cubic-bezier(0.645, 0.045, 0.355, 1.000)",
      "ease-in-out-quart": "cubic-bezier(0.770, 0.000, 0.175, 1.000)",
      "ease-in-out-quint": "cubic-bezier(0.860, 0.000, 0.070, 1.000)",
      "ease-in-out-sine": "cubic-bezier(0.445, 0.050, 0.550, 0.950)",
      "ease-in-out-expo": "cubic-bezier(1.000, 0.000, 0.000, 1.000)",
      "ease-in-out-circ": "cubic-bezier(0.785, 0.135, 0.150, 0.860)",
      "ease-in-out-back": "cubic-bezier(0.680, -0.550, 0.265, 1.550)"
    };
    return easings;
  }();
  function CSS(item, animations) {
    this.stylesheet = document.styleSheets[0];
    this.item = item;
    this.animations = animations;
    this.total = this.animations.map(function(a) {
      return a.delay + a.duration;
    }).reduce(function(a, b) {
      return a + b;
    });
    this.style();
  }
  CSS.prototype.pause = function pause() {
    this.item.dom.style[_animationProperty + "PlayState"] = "paused";
    return this;
  };
  CSS.prototype.resume = function resume() {
    this.item.dom.style[_animationProperty + "PlayState"] = "running";
    return this;
  };
  CSS.prototype.stop = function stop() {
    var style = getComputedStyle(this.item.dom), transform = style[_vendor + "transform"], opacity = style.opacity;
    this.item.dom.style[_animationProperty] = "";
    this.item.dom.style[_transitionProperty] = "";
    this.item.dom.style[_transformProperty] = transform;
    this.item.dom.style.opacity = opacity;
    this.item.state = Matrix.decompose(Matrix.parse(transform));
    this.item.state.opacity = opacity;
    return this;
  };
  CSS.prototype.handle = function handle(event) {
    var onEnd = function end() {
      this.stop();
      this.item.dom.removeEventListener(vendor + event, onEnd, false);
    }.bind(this);
    this.item.dom.addEventListener(vendor + event, onEnd, false);
  };
  CSS.prototype.style = function style() {
    var animation = "a" + Date.now() + "r" + Math.floor(Math.random() * 1e3);
    if (this.item.animations[0] instanceof Animation && this.item.animations.length == 1) {
      var a = this.item.animations[0];
      a.init();
      this.item.dom.style[_transitionProperty] = "all " + a.duration + "ms " + easings.css[a.easeName] + " " + a.delay + "ms";
      a.transform(1);
      this.handle("TransitionEnd");
      this.item.style();
    } else {
      this.stylesheet.insertRule(this.keyframes(animation), 0);
      this.handle("AnimationEnd");
      this.item.dom.style[_animationProperty] = animation + " " + this.total + "ms" + (this.item.infinite ? " infinite " : " ") + "forwards";
    }
    this.item.animations = [];
  };
  CSS.prototype.keyframes = function keyframes(name) {
    var time = 0, rule = [ "@" + _vendor + "keyframes " + name + "{" ];
    for (var i = 0; i < this.animations.length; i++) {
      var a = this.animations[i], aNext = this.animations[i + 1];
      a.init();
      if (a instanceof Animation) {
        i === 0 && rule.push(this.frame(0, easings.css[a.easeName]));
        a.delay && rule.push(this.frame(time += a.delay));
        a.transform(1);
        rule.push(this.frame(time += a.duration, aNext && easings.css[aNext.easeName]));
      } else {
        var frames = [];
        a.animations.forEach(function(a) {
          a.delay && frames.indexOf(a.delay) === -1 && frames.push(a.delay);
          a.duration && frames.indexOf(a.delay + a.duration) === -1 && frames.push(a.delay + a.duration);
        });
        for (var k = 0; k < frames.length; ++k) {
          var frame = frames[k];
          for (var j = 0; j < a.animations.length; ++j) {
            var pa = a.animations[j];
            if (pa.delay >= frame || pa.delay + pa.duration < frame) continue;
            pa.transform(pa.ease((frame - pa.delay) / pa.duration));
          }
          rule.push(this.frame(time += frame));
        }
      }
    }
    rule.push("}");
    return rule.join("");
  };
  CSS.prototype.percent = function percent(time) {
    return (time * 100 / this.total).toFixed(3);
  };
  CSS.prototype.frame = function frame(time, ease) {
    var percent = this.percent(time);
    return percent + "% {" + (percent ? _vendor + "transform:" + this.item.matrix() + ";" : "") + (percent ? "opacity:" + this.item.opacity() + ";" : "") + (ease ? _vendor + "animation-timing-function:" + ease + ";" : "") + "}";
  };
  function EventEmitter() {
    this.handlers = {};
  }
  EventEmitter.prototype.on = function on(event, handler) {
    (this.handlers[event] = this.handlers[event] || []).push(handler);
    return this;
  };
  EventEmitter.prototype.off = function off(event, handler) {
    var handlers = this.handlers[event];
    if (handler) {
      handlers.splice(handlers.indexOf(handler), 1);
    } else {
      this.handlers[event] = [];
    }
    return this;
  };
  EventEmitter.prototype.emit = function emit(event, ctx) {
    var args = Array.prototype.slice.call(arguments, 1), handlers = this.handlers[event];
    if (handlers) {
      for (var i = 0; i < handlers.length; ++i) {
        handlers[i].apply(ctx || this, args);
      }
    }
    return this;
  };
  function Animation(item, transform, duration, ease, delay) {
    EventEmitter.call(this);
    this.item = item;
    this.translate = transform.translate && transform.translate.map(parseFloat);
    this.rotate = transform.rotate && transform.rotate.map(parseFloat);
    this.scale = transform.scale;
    this.opacity = transform.opacity;
    this.start = null;
    this.diff = null;
    this.duration = parseInt(duration || transform.duration, 10) || 500;
    this.delay = parseInt(delay || transform.delay, 10) || 0;
    this.ease = easings[ease] || easings[transform.ease] || easings.linear;
    this.easeName = ease || "linear";
  }
  Animation.prototype = new EventEmitter();
  Animation.prototype.constructor = Animation;
  Animation.prototype.init = function init(tick, force) {
    if (this.start !== null && !force) return;
    this.start = tick + this.delay;
    var state = this.item.state;
    this.initial = {
      translate: state.translate.slice(),
      rotate: state.rotate.slice(),
      scale: state.scale.slice(),
      opacity: state.opacity
    };
    this.emit("start");
  };
  Animation.prototype.animate = function animate() {
    return this.item.animate.apply(this.item, arguments);
  };
  Animation.prototype.css = function css() {
    return this.item.css();
  };
  Animation.prototype.infinite = function infinite() {
    this.item.infinite = true;
    return this;
  };
  Animation.prototype.run = function run(tick) {
    if (tick < this.start) return;
    var percent = (tick - this.start) / this.duration;
    percent = this.ease(percent);
    this.transform(percent);
  };
  Animation.prototype.pause = function pause() {
    this.diff = Date.now() - this.start;
  };
  Animation.prototype.resume = function resume() {
    this.start = Date.now() - this.diff;
  };
  Animation.prototype.set = function set(type, percent) {
    var state = this.item.state, initial = this.initial;
    if (Array.isArray(this[type])) {
      for (var i = 0; i < 3; ++i) if (this[type][i]) {
        state[type][i] = initial[type][i] + this[type][i] * percent;
      }
    } else if (typeof this[type] !== "undefined") {
      state[type] = initial[type] + (this[type] - initial[type]) * percent;
    }
  };
  Animation.prototype.transform = function transform(percent) {
    this.set("translate", percent);
    this.set("rotate", percent);
    this.set("scale", percent);
    this.set("opacity", percent);
  };
  Animation.prototype.end = function end(abort) {
    !abort && this.transform(1);
    this.start = null;
    this.emit("end");
  };
  function Parallel(item, animations, duration, ease, delay) {
    EventEmitter.call(this);
    this.item = item;
    this.animations = animations.map(function(a) {
      return new Animation(item, a.transform || {
        translate: a.translate,
        rotate: a.rotate,
        scale: a.scale
      }, a.duration || duration, a.ease || ease, a.delay || delay);
    });
    this.start = null;
    this.delay = 0;
    this.easeName = ease || "linear";
    this.duration = Math.max.apply(null, this.animations.map(function(a) {
      return a.duration + a.delay;
    }));
  }
  Parallel.prototype = new EventEmitter();
  Parallel.prototype.constructor = Parallel;
  Parallel.prototype.init = function init(tick) {
    if (this.start !== null) return;
    this.start = tick;
    for (var i = 0; i < this.animations.length; ++i) {
      this.animations[i].init(tick);
    }
    this.emit("start");
  };
  Parallel.prototype.animate = function animate() {
    return this.item.animate.apply(this.item, arguments);
  };
  Parallel.prototype.css = function css() {
    return this.item.css();
  };
  Parallel.prototype.infinite = function infinite() {
    this.item.infinite = true;
    return this;
  };
  Parallel.prototype.run = function run(tick) {
    for (var i = 0; i < this.animations.length; ++i) {
      var a = this.animations[i];
      if (a.start + a.duration <= tick) {
        this.animations.splice(i--, 1);
        a.end();
        continue;
      }
      a.run(tick);
    }
  };
  Parallel.prototype.pause = function pause() {
    for (var i = 0; i < this.animations.length; ++i) {
      this.animations[i].pause();
    }
  };
  Parallel.prototype.resume = function resume() {
    for (var i = 0; i < this.animations.length; ++i) {
      this.animations[i].resume();
    }
  };
  Parallel.prototype.end = function end(abort) {
    for (var i = 0; i < this.animations.length; ++i) {
      this.animations[i].end(abort);
    }
    this.emit("end");
  };
  function World(start) {
    this.items = [];
    this._frame = null;
    start && this.init();
  }
  World.prototype.init = function init() {
    var self = this;
    this._frame = _requestAnimationFrame(update);
    function update(tick) {
      self.update(tick);
      self._frame = _requestAnimationFrame(update);
    }
  };
  World.prototype.add = function add(node) {
    var item = new Item(node);
    this.items.push(item);
    return item;
  };
  World.prototype.cancel = function cancel() {
    this._frame && _cancelAnimationFrame(this._frame);
    this._frame = 0;
  };
  World.prototype.stop = function stop() {
    this.cancel();
    for (var i = 0; i < this.items.length; ++i) {
      this.items[i].stop();
    }
  };
  World.prototype.pause = function pause() {
    this.cancel();
    for (var i = 0; i < this.items.length; ++i) {
      this.items[i].pause();
    }
  };
  World.prototype.resume = function resume() {
    for (var i = 0; i < this.items.length; ++i) {
      this.items[i].resume();
    }
    this.init();
  };
  World.prototype.update = function update(tick) {
    for (var i = 0; i < this.items.length; ++i) {
      this.items[i].update(tick);
    }
  };
  World.prototype.on = function on(event, handler) {
    addEventListener(event, handler, true);
  };
  var Vector = {
    set: function(x, y, z) {
      return [ x, y, z ];
    },
    length: function length(x, y, z) {
      if (Array.isArray(x)) {
        y = x[1];
        z = x[2];
        x = x[0];
      }
      return Math.sqrt(x * x + y * y + z * z);
    },
    add: function add(a, b) {
      return [ a[0] + b[0], a[1] + b[1], a[2] + b[2] ];
    },
    sub: function sub(a, b) {
      return [ a[0] - b[0], a[1] - b[1], a[2] - b[2] ];
    },
    norm: function norm(x, y, z) {
      if (Array.isArray(x)) {
        y = x[1];
        z = x[2];
        x = x[0];
      }
      var len = Vector.length(x, y, z);
      if (len !== 0) {
        x /= len;
        y /= len;
        z /= len;
      } else {
        x = 0;
        y = 0;
        z = 0;
      }
      return [ x, y, z ];
    },
    cross: function cross(a, b) {
      var x = a[1] * b[2] - a[2] * b[1], y = a[2] * b[0] - a[0] * b[2], z = a[1] * b[1] - a[1] * b[0];
      return [ x, y, z ];
    },
    copy: function copy(v) {
      reutn[v[0], v[1], v[2]];
    }
  };
  var radians = Math.PI / 180;
  var Matrix = {
    identity: function identity() {
      return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    },
    multiply: function multiply(a, b) {
      var c = Matrix.identity();
      c[0] = a[0] * b[0] + a[1] * b[4] + a[2] * b[8];
      c[1] = a[0] * b[1] + a[1] * b[5] + a[2] * b[9];
      c[2] = a[0] * b[2] + a[1] * b[6] + a[2] * b[10];
      c[4] = a[4] * b[0] + a[5] * b[4] + a[6] * b[8];
      c[5] = a[4] * b[1] + a[5] * b[5] + a[6] * b[9];
      c[6] = a[4] * b[2] + a[5] * b[6] + a[6] * b[10];
      c[8] = a[8] * b[0] + a[9] * b[4] + a[10] * b[8];
      c[9] = a[8] * b[1] + a[9] * b[5] + a[10] * b[9];
      c[10] = a[8] * b[2] + a[9] * b[6] + a[10] * b[10];
      c[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + b[12];
      c[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + b[13];
      c[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + b[14];
      return 2 >= arguments.length ? c : multiply.apply(null, [ c ].concat(Array.prototype.slice.call(arguments, 2)));
    },
    translate: function translate(tx, ty, tz) {
      if (!(tx || ty || tz)) return Matrix.identity();
      tx || (tx = 0);
      ty || (ty = 0);
      tz || (tz = 0);
      return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1 ];
    },
    scale: function scale(sx, sy, sz) {
      if (!(sx || sy || sz)) return Matrix.identity();
      sx || (sx = 1);
      sy || (sy = 1);
      sz || (sz = 1);
      return [ sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1 ];
    },
    rotate: function rotate(ax, ay, az) {
      if (!(ax || ay || az)) return Matrix.identity();
      ax || (ax = 0);
      ay || (ay = 0);
      az || (az = 0);
      ax *= radians;
      ay *= radians;
      az *= radians;
      var sx = Math.sin(ax), cx = Math.cos(ax), sy = Math.sin(ay), cy = Math.cos(ay), sz = Math.sin(az), cz = Math.cos(az);
      return [ cy * cz, cx * sz + sx * sy * cz, sx * sz - cx * sy * cz, 0, -cy * sz, cx * cz - sx * sy * sz, sx * cz + cx * sy * sz, 0, sy, -sx * cy, cx * cy, 0, 0, 0, 0, 1 ];
    },
    rotate3d: function rotate3d(x, y, z, a) {
      a || (a = 0);
      a *= radians;
      var s = Math.sin(a), c = Math.cos(a), norm = Vector.norm(x, y, z);
      x = norm[0];
      y = norm[1];
      z = norm[2];
      var xx = x * x, yy = y * y, zz = z * z, _c = 1 - c;
      return [ xx + (1 - xx) * c, x * y * _c + z * s, x * z * _c - y * s, 0, x * y * _c - z * s, yy + (1 - yy) * c, y * z * _c + x * s, 0, x * z * _c + y * s, y * z * _c - x * s, zz + (1 - zz) * c, 0, 0, 0, 0, 1 ];
    },
    skew: function skew(ax, ay) {
      if (!(ax || ay)) return Matrix.identity();
      ax || (ax = 0);
      ay || (ay = 0);
      ax *= radians;
      ay *= radians;
      return [ 1, Math.tan(ay), 0, 0, Math.tan(ax), 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    },
    perspective: function perspective(p) {
      p = -1 / p;
      return [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, p, 0, 0, 0, 1 ];
    },
    parse: function parse(s) {
      var m = s.match(/\((.+)\)/)[1].split(/,\s?/);
      if (m.length === 6) {
        m.splice(2, 0, "0", "0");
        m.splice(6, 0, "0", "0");
        m.splice(8, 0, "0", "0", "1", "0");
        m.push("0", "1");
      }
      return m;
    },
    inverse: function inverse(m) {
      var a = Matrix.identity(), inv0 = m[5] * m[10] - m[6] * m[9], inv1 = m[1] * m[10] - m[2] * m[9], inv2 = m[1] * m[6] - m[2] * m[5], inv4 = m[4] * m[10] - m[6] * m[8], inv5 = m[0] * m[10] - m[2] * m[8], inv6 = m[0] * m[6] - m[2] * m[4], inv8 = m[4] * m[9] - m[5] * m[8], inv9 = m[0] * m[9] - m[1] * m[8], inv10 = m[0] * m[5] - m[1] * m[4], det = 1 / (m[0] * inv0 - m[1] * inv4 + m[2] * inv8);
      a[0] = det * inv0;
      a[1] = -det * inv1;
      a[2] = det * inv2;
      a[4] = -det * inv4;
      a[5] = det * inv5;
      a[6] = -det * inv6;
      a[8] = det * inv8;
      a[9] = -det * inv9;
      a[10] = det * inv10;
      a[12] = -m[12] * a[0] - m[13] * a[4] - m[14] * a[8];
      a[13] = -m[12] * a[1] - m[13] * a[5] - m[14] * a[9];
      a[14] = -m[12] * a[2] - m[13] * a[6] - m[14] * a[10];
      return a;
    },
    compose: function compose(translate, rotate, scale) {
      translate || (translate = []);
      rotate || (rotate = []);
      scale || (scale = []);
      var a = Matrix.rotate(rotate[0], rotate[1], rotate[2]);
      if (scale.length) {
        a[0] *= scale[0];
        a[1] *= scale[0];
        a[2] *= scale[0];
        a[4] *= scale[1];
        a[5] *= scale[1];
        a[6] *= scale[1];
        a[8] *= scale[2];
        a[9] *= scale[2];
        a[10] *= scale[2];
      }
      if (translate.length) {
        a[12] = translate[0];
        a[13] = translate[1];
        a[14] = translate[2];
      }
      return a;
    },
    decompose: function decompose(m) {
      var sX = Vector.length(m[0], m[1], m[2]), sY = Vector.length(m[4], m[5], m[6]), sZ = Vector.length(m[8], m[9], m[10]);
      var rX = Math.atan2(-m[9] / sZ, m[10] / sZ) / radians, rY = Math.asin(m[8] / sZ) / radians, rZ = Math.atan2(-m[4] / sY, m[0] / sX) / radians;
      if (m[4] === 1 || m[4] === -1) {
        rX = 0;
        rY = m[4] * -Math.PI / 2;
        rZ = m[4] * Math.atan2(m[6] / sY, m[5] / sY) / radians;
      }
      var tX = m[12], tY = m[13], tZ = m[14];
      return {
        translate: [ tX, tY, tZ ],
        rotate: [ rX, rY, rZ ],
        scale: [ sX, sY, sZ ]
      };
    },
    transpose: function transpose(m) {
      var t;
      t = m[1];
      m[1] = m[4];
      m[4] = t;
      t = m[2];
      m[2] = m[8];
      m[8] = t;
      t = m[6];
      m[6] = m[9];
      m[9] = t;
      t = m[3];
      m[3] = m[12];
      m[12] = t;
      t = m[7];
      m[7] = m[13];
      m[13] = t;
      t = m[11];
      m[11] = m[14];
      m[14] = t;
      return m;
    },
    lookAt: function lookAt(eye, target, up) {
      var z = Vector.sub(eye, target);
      z = Vector.norm(z);
      if (Vector.length(z) === 0) z[2] = 1;
      var x = Vector.cross(up, z);
      if (Vector.length(x) === 0) {
        z[0] += 1e-4;
        x = Vector.norm(Vector.cross(up, z));
      }
      var y = Vector.cross(z, x);
      var a = Matrix.identity();
      a[0] = x[0];
      a[1] = x[1];
      a[2] = x[2];
      a[4] = y[0];
      a[5] = y[1];
      a[6] = y[2];
      a[8] = z[0];
      a[9] = z[1];
      a[10] = z[2];
      return a;
    },
    stringify: function stringify(m) {
      for (var i = 0; i < m.length; ++i) if (Math.abs(m[i]) < 1e-6) m[i] = 0;
      return "matrix3d(" + m.join() + ")";
    },
    toTestString: function toTestString(m) {
      function clamp(n) {
        return n.toFixed(6);
      }
      function isAffine(m) {
        return m[2] === 0 && m[3] === 0 && m[6] === 0 && m[7] === 0 && m[8] === 0 && m[9] === 0 && m[10] === 1 && m[11] === 0 && m[14] === 0 && m[15] === 1;
      }
      function filterAffine(_, i) {
        return [ 0, 1, 4, 5, 12, 13 ].indexOf(i) !== -1;
      }
      if (isAffine(m)) {
        return "matrix(" + m.filter(filterAffine).map(clamp).join(", ") + ")";
      }
      return "matrix3d(" + m.map(clamp).join(", ") + ")";
    }
  };
  function Item(node) {
    EventEmitter.call(this);
    this.dom = node;
    this.animations = [];
    this.init();
  }
  Item.prototype = new EventEmitter();
  Item.prototype.constructor = Item;
  Item.prototype.init = function init() {
    this.infinite = false;
    this.running = true;
    this.state = {
      translate: [ 0, 0, 0 ],
      rotate: [ 0, 0, 0 ],
      scale: [ 1, 1, 1 ],
      opacity: 1
    };
  };
  Item.prototype.update = function update(tick) {
    this.animation(tick);
    this.style();
  };
  Item.prototype.pause = function pause() {
    if (!this.running) return;
    this.animations.length && this.animations[0].pause();
    this.running = false;
  };
  Item.prototype.resume = function resume() {
    if (this.running) return;
    this.animations.length && this.animations[0].resume();
    this.running = true;
  };
  Item.prototype.style = function style() {
    this.dom.style[_transformProperty] = this.matrix();
    this.dom.style.opacity = this.opacity();
  };
  Item.prototype.matrix = function matrix() {
    var state = this.state;
    return Matrix.stringify(Matrix.compose(state.translate, state.rotate, state.scale));
  };
  Item.prototype.center = function center() {
    var state = this.state;
    return Matrix.decompose(Matrix.inverse(Matrix.compose(state.translate, state.rotate, state.scale)));
  };
  Item.prototype.lookAt = function lookAt(vector) {
    var transform = Matrix.decompose(Matrix.lookAt(vector, this.state.translate, [ 0, 1, 0 ]));
    this.state.rotate = transform.rotate;
  };
  Item.prototype.opacity = function opacity() {
    return this.state.opacity;
  };
  Item.prototype.add = function add(type, a) {
    this.state[type][0] += a[0];
    this.state[type][1] += a[1];
    this.state[type][2] += a[2];
    return this;
  };
  Item.prototype.set = function set(type, a) {
    this.state[type] = a;
    return this;
  };
  Item.prototype.translate = function translate(t) {
    return this.add("translate", t);
  };
  Item.prototype.rotate = function rotate(r) {
    return this.add("rotate", r);
  };
  Item.prototype.scale = function scale(s) {
    return this.add("scale", s);
  };
  Item.prototype.clear = function clear() {
    this.state.translate = [ 0, 0, 0 ];
    this.state.rotate = [ 0, 0, 0 ];
    this.state.scale = [ 1, 1, 1 ];
    this.state.opacity = 1;
  };
  Item.prototype.animate = function animate(transform, duration, ease, delay) {
    var ctor = Array.isArray(transform) ? Parallel : Animation, animation = new ctor(this, transform, duration, ease, delay);
    this.animations.push(animation);
    return animation;
  };
  Item.prototype.animation = function animation(tick) {
    if (!this.running || this.animations.length === 0) return;
    while (this.animations.length !== 0) {
      var first = this.animations[0];
      first.init(tick);
      if (first.start + first.duration <= tick) {
        this.infinite && this.animations.push(first);
        this.animations.shift();
        first.end();
        continue;
      }
      first.run(tick);
      break;
    }
  };
  Item.prototype.finish = function finish(abort) {
    if (this.animations.length === 0) return this;
    for (var i = 0; i < this.animations.length; ++i) {
      var a = this.animations[i];
      a.end(abort);
    }
    this.animations = [];
    this.infinite = false;
    return this;
  };
  Item.prototype.stop = function stop() {
    return this.finish(true);
  };
  Item.prototype.css = function css() {
    return new CSS(this, this.animations);
  };
})();