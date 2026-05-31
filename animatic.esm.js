// src/utils.js
var prefix = ([].slice.call(getComputedStyle(document.documentElement, null)).join("").match(/(-(moz|webkit|ms)-)transform/) || [])[1];
var transformProperty = getProperty("transform");
var animationProperty = getProperty("animation");
var fixTick;
function getProperty(name) {
  return name;
}
requestAnimationFrame(function(tick) {
  fixTick = tick > 1e12 != performance.now() > 1e12;
});
function merge(obj, ...sources) {
  let i = 1;
  while (i <= sources.length) {
    const source = sources[i++ - 1];
    for (const property in source) {
      if (Array.isArray(source[property])) {
        const target = (
          /** @type {Array<unknown>} */
          obj[property] ||= []
        );
        for (let j = 0; j < source[property].length; ++j) {
          const value = source[property][j];
          if (value !== void 0) {
            target[j] = value;
          }
        }
      } else {
        obj[property] = source[property];
      }
    }
  }
  return obj;
}

// src/eventemitter.js
var EventEmitter = class {
  constructor() {
    this.handlers = {};
  }
  /**
   * Adds handler for event
   * @param {string} event
  * @param {(...args: Array<unknown>) => unknown} handler
   * @returns {EventEmitter}
   */
  on(event, handler) {
    this.handlers[event] ??= [];
    this.handlers[event].push(handler);
    return this;
  }
  /**
   * Removes event handler
   * @param {string} event
  * @param {((...args: Array<unknown>) => unknown)=} handler
   * @returns {EventEmitter}
   */
  off(event, handler) {
    const handlers = this.handlers[event];
    if (handler) {
      if (!handlers) return this;
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    } else {
      delete this.handlers[event];
    }
    return this;
  }
  /**
   * Triggers event
   * @param {string} event
  * @param {...unknown} args
  * @returns {EventEmitter}
   */
  emit(event, ...args) {
    const handlers = this.handlers[event];
    if (handlers) {
      for (let i = 0; i < handlers.length; ++i) {
        handlers[i].apply(this, args);
      }
    }
    return this;
  }
  /**
   * List all event listeners
   * @param {string} event
  * @returns {Array<(...args: Array<unknown>) => unknown>}
   */
  listeners(event) {
    return this.handlers[event] || [];
  }
};

// src/math/vector.js
var Vector = {
  /**
   * @param {number|Array<number>=} x
   * @param {number=} y
   * @param {number=} z
   * @returns {Array<number>}
   */
  set(x, y, z) {
    if (Array.isArray(x)) {
      y = x[1];
      z = x[2];
      x = x[0];
    }
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = x;
      z = x;
    }
    return [x, y, z];
  },
  /**
   * @param {number|Array<number>} x
   * @param {number=} y
   * @param {number=} z
   * @returns {number}
   */
  length(x, y, z) {
    if (Array.isArray(x)) {
      y = x[1];
      z = x[2];
      x = x[0];
    }
    return Math.sqrt(x * x + y * y + z * z);
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
    ];
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
    ];
  },
  /**
   * @param {number|Array<number>} x
   * @param {number=} y
   * @param {number=} z
   * @returns {Array<number>}
   */
  norm(x, y, z) {
    if (Array.isArray(x)) {
      y = x[1];
      z = x[2];
      x = x[0];
    }
    const len = this.length(x, y, z);
    if (len !== 0) {
      x /= len;
      y /= len;
      z /= len;
    } else {
      x = 0;
      y = 0;
      z = 0;
    }
    return [x, y, z];
  },
  /**
   * @param {Array<number>} a
   * @param {Array<number>} b
   * @returns {number}
   */
  dist(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    const dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  /**
   * @param {Array<number>} a
   * @param {Array<number>} b
   * @returns {Array<number>}
   */
  cross(a, b) {
    const x = a[1] * b[2] - a[2] * b[1];
    const y = a[2] * b[0] - a[0] * b[2];
    const z = a[0] * b[1] - a[1] * b[0];
    return [x, y, z];
  },
  /**
   * @param {Array<number>} v
   * @returns {Array<number>}
   */
  clone(v) {
    return v.slice();
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
      f = y;
      y = x[1];
      z = x[2];
      x = x[0];
    }
    return [x * f, y * f, z * f];
  },
  /**
   * @returns {Array<number>}
   */
  zero() {
    return [0, 0, 0];
  }
};

// src/animations/easings.js
var easings = (function() {
  const fn = {
    /** @param {number} p */
    quad: function(p) {
      return Math.pow(p, 2);
    },
    /** @param {number} p */
    cubic: function(p) {
      return Math.pow(p, 3);
    },
    /** @param {number} p */
    quart: function(p) {
      return Math.pow(p, 4);
    },
    /** @param {number} p */
    quint: function(p) {
      return Math.pow(p, 5);
    },
    /** @param {number} p */
    expo: function(p) {
      return Math.pow(p, 6);
    },
    /** @param {number} p */
    sine: function(p) {
      return 1 - Math.cos(p * Math.PI / 2);
    },
    /** @param {number} p */
    circ: function(p) {
      return 1 - Math.sqrt(1 - p * p);
    },
    /** @param {number} p */
    back: function(p) {
      return p * p * (3 * p - 2);
    }
  };
  const easings2 = {
    css: {},
    /** @param {number} p */
    linear: function(p) {
      return p;
    }
  };
  Object.keys(fn).forEach(function(name) {
    const ease = fn[name];
    easings2["ease-in-" + name] = ease;
    easings2["ease-out-" + name] = function(p) {
      return 1 - ease(1 - p);
    };
    easings2["ease-in-out-" + name] = function(p) {
      return p < 0.5 ? ease(p * 2) / 2 : 1 - ease(p * -2 + 2) / 2;
    };
  });
  easings2.css = {
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
  return easings2;
})();

// src/math/matrix.js
var radians = Math.PI / 180;
var Matrix = {
  /**
  * @returns {Array<number>}
   */
  identity() {
    return [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
  },
  /**
   * @param {Array<number>} a
   * @param {Array<number>} b
   * @param {...Array<number>} matrices
   * @returns {Array<number>}
   */
  multiply(a, b, ...matrices) {
    const c = this.identity();
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
    let result = c;
    for (let i = 0; i < matrices.length; ++i) {
      result = this.multiply(result, matrices[i]);
    }
    return result;
  },
  /**
   * @param {number=} tx
   * @param {number=} ty
   * @param {number=} tz
   * @returns {Array<number>}
   */
  translate(tx, ty, tz) {
    if (!(tx || ty || tz)) return this.identity();
    tx ||= 0;
    ty ||= 0;
    tz ||= 0;
    return [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      tx,
      ty,
      tz,
      1
    ];
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
  /**
   * @param {number=} sx
   * @param {number=} sy
   * @param {number=} sz
   * @returns {Array<number>}
   */
  scale(sx, sy, sz) {
    if (!(sx || sy || sz)) return this.identity();
    sx ||= 1;
    sy ||= 1;
    sz ||= 1;
    return [
      sx,
      0,
      0,
      0,
      0,
      sy,
      0,
      0,
      0,
      0,
      sz,
      0,
      0,
      0,
      0,
      1
    ];
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
  /**
   * @param {number=} ax
   * @param {number=} ay
   * @param {number=} az
   * @returns {Array<number>}
   */
  rotate(ax, ay, az) {
    if (!(ax || ay || az)) return this.identity();
    ax ||= 0;
    ay ||= 0;
    az ||= 0;
    ax *= radians;
    ay *= radians;
    az *= radians;
    const sx = Math.sin(ax);
    const cx = Math.cos(ax);
    const sy = Math.sin(ay);
    const cy = Math.cos(ay);
    const sz = Math.sin(az);
    const cz = Math.cos(az);
    return [
      cy * cz,
      cx * sz + sx * sy * cz,
      sx * sz - cx * sy * cz,
      0,
      -cy * sz,
      cx * cz - sx * sy * sz,
      sx * cz + cx * sy * sz,
      0,
      sy,
      -sx * cy,
      cx * cy,
      0,
      0,
      0,
      0,
      1
    ];
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
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number=} a
   * @returns {Array<number>}
   */
  rotate3d(x, y, z, a = 0) {
    a *= radians;
    const s = Math.sin(a);
    const c = Math.cos(a);
    const norm = Vector.norm(x, y, z);
    x = norm[0];
    y = norm[1];
    z = norm[2];
    const xx = x * x;
    const yy = y * y;
    const zz = z * z;
    const _c = 1 - c;
    return [
      xx + (1 - xx) * c,
      x * y * _c + z * s,
      x * z * _c - y * s,
      0,
      x * y * _c - z * s,
      yy + (1 - yy) * c,
      y * z * _c + x * s,
      0,
      x * z * _c + y * s,
      y * z * _c - x * s,
      zz + (1 - zz) * c,
      0,
      0,
      0,
      0,
      1
    ];
  },
  /**
   * @param {number=} ax
   * @param {number=} ay
   * @returns {Array<number>}
   */
  skew(ax, ay) {
    if (!(ax || ay)) return this.identity();
    ax ||= 0;
    ay ||= 0;
    ax *= radians;
    ay *= radians;
    return [
      1,
      Math.tan(ay),
      0,
      0,
      Math.tan(ax),
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
  },
  /*
  skewX(a) {
  	return this.skew(a, 0)
  },
  skewY(a) {
  	return this.skew(0, a)
  },
  */
  /**
   * @param {number} p
   * @returns {Array<number>}
   */
  perspective(p) {
    p = -1 / p;
    return [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      p,
      0,
      0,
      0,
      1
    ];
  },
  /**
    * @param {string} s
  * @returns {Array<number>}
    */
  parse(s) {
    const match = s.match(/\((.+)\)/);
    if (!match) return this.identity();
    const m = match[1].split(/,\s?/).map(Number);
    if (m.length === 6) {
      m.splice(2, 0, 0, 0);
      m.splice(6, 0, 0, 0);
      m.splice(8, 0, 0, 0, 1, 0);
      m.push(0, 1);
    }
    return m;
  },
  /**
   * @param {Array<number>} m
   * @returns {Array<number>}
   */
  inverse(m) {
    const a = this.identity();
    const inv0 = m[5] * m[10] - m[6] * m[9];
    const inv1 = m[1] * m[10] - m[2] * m[9];
    const inv2 = m[1] * m[6] - m[2] * m[5];
    const inv4 = m[4] * m[10] - m[6] * m[8];
    const inv5 = m[0] * m[10] - m[2] * m[8];
    const inv6 = m[0] * m[6] - m[2] * m[4];
    const inv8 = m[4] * m[9] - m[5] * m[8];
    const inv9 = m[0] * m[9] - m[1] * m[8];
    const inv10 = m[0] * m[5] - m[1] * m[4];
    const det = 1 / (m[0] * inv0 - m[1] * inv4 + m[2] * inv8);
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
  /**
   * @param {Array<number>=} translate
   * @param {Array<number>=} rotate
   * @param {Array<number>=} scale
   * @returns {Array<number>}
   */
  compose(translate = [], rotate = [], scale = []) {
    const a = this.rotate(rotate[0], rotate[1], rotate[2]);
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
  /**
   * @param {Array<number>} m
   * @returns {MatrixTransform}
   */
  decompose(m) {
    const sX = Vector.length(m[0], m[1], m[2]);
    const sY = Vector.length(m[4], m[5], m[6]);
    const sZ = Vector.length(m[8], m[9], m[10]);
    let rX = Math.atan2(-m[9] / sZ, m[10] / sZ) / radians;
    let rY = Math.asin(m[8] / sZ) / radians;
    let rZ = Math.atan2(-m[4] / sY, m[0] / sX) / radians;
    if (m[4] === 1 || m[4] === -1) {
      rX = 0;
      rY = m[4] * -Math.PI / 2;
      rZ = m[4] * Math.atan2(m[6] / sY, m[5] / sY) / radians;
    }
    const tX = m[12];
    const tY = m[13];
    const tZ = m[14];
    return {
      translate: [tX, tY, tZ],
      rotate: [rX, rY, rZ],
      scale: [sX, sY, sZ]
    };
  },
  /**
   * @param {Array<number>} m
   * @returns {Array<number>}
   */
  transpose(m) {
    let t;
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
  /**
   * @param {Array<number>} eye
   * @param {Array<number>} target
   * @param {Array<number>} up
   * @returns {Array<number>}
   */
  lookAt(eye, target, up) {
    let z = Vector.sub(eye, target);
    z = Vector.norm(z);
    if (Vector.length(z) === 0)
      z[2] = 1;
    let x = Vector.cross(up, z);
    if (Vector.length(x) === 0) {
      z[0] += 1e-4;
      x = Vector.norm(Vector.cross(up, z));
    }
    const y = Vector.cross(z, x);
    const a = this.identity();
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
  /**
   * @param {Array<number>} m
   * @returns {string}
   */
  stringify(m) {
    for (let i = 0; i < m.length; ++i) {
      if (Math.abs(m[i]) < 1e-5) m[i] = 0;
    }
    return "matrix3d(" + m.join() + ")";
  }
};

// src/animations/css_animation.js
var CssAnimation = class {
  /**
   * Creates new animation
  * @param {import("../item.js").Item} item Object to animate
  * @param {CssAnimationOptions | string} animation
   * @param {number} duration
   * @param {string} ease Timing function
   * @param {number} delay
   * @param {boolean} generated
   * @constructor
   */
  constructor(item, animation, duration, ease, delay, generated) {
    this.item = item;
    const options = typeof animation === "string" ? { name: animation } : animation;
    const cssEasings = (
      /** @type {{ css: Record<string, string> }} */
      easings.css
    );
    this.name = options.name || "";
    this.start = null;
    this.diff = null;
    this.duration = (options.duration || duration) | 0;
    this.delay = (options.delay || delay) | 0;
    this.ease = cssEasings[options.ease || ease || "linear"] || cssEasings.linear;
    this._infinite = false;
    this._generated = generated;
  }
  /**
   * Starts animation timer
   * @param {number} tick Timestamp
   * @param {boolean=} force Force initialization
   */
  init(tick, force) {
    if (this.start !== null && !force) return;
    this.start = tick + this.delay;
    this.item.style(
      animationProperty,
      this.name + " " + this.duration + "ms " + this.ease + " " + this.delay + "ms" + (this._infinite ? " infinite" : "") + " forwards"
    );
  }
  /**
   * Runs one tick of animation
   */
  run() {
  }
  /**
   * Pauses animation
   */
  pause() {
    this.item.style(animationProperty + "-play-state", "paused");
    this.diff = performance.now() - (this.start || 0);
  }
  /**
   * Resumes animation
   */
  resume() {
    this.item.style(animationProperty + "-play-state", "running");
    this.start = performance.now() - (this.diff || 0);
  }
  /**
   * Ends animation
   */
  end() {
    if (this._generated) {
      const computed = getComputedStyle(this.item.dom, null);
      const transform = computed[transformProperty];
      this.item.style(animationProperty, "");
      this.item.state = Matrix.decompose(Matrix.parse(transform));
      this.item.style();
    }
    this.start = null;
  }
};

// src/animations/tween.js
var Tween = class _Tween {
  /**
   * @param {Array<number|string>|number|string|undefined} start
   * @param {Array<number|string>|number|string|undefined} end
   * @param {string} property
   */
  constructor(start, end, property) {
    const type = _Tween.propTypes[property] || _Tween.NUMERIC;
    this.type = type;
    this.start = _Tween.parseValue(start, type);
    this.end = _Tween.parseValue(end, type);
    this.suffix = _Tween.px.indexOf(property) !== -1 ? "px" : "";
  }
  static NUMERIC = "NUMERIC";
  static COLOR = "COLOR";
  /** @type {Record<string, string>} */
  static propTypes = {
    color: _Tween.COLOR,
    backgroundColor: _Tween.COLOR,
    borderColor: _Tween.COLOR
  };
  static px = "margin,marginTop,marginLeft,marginBottom,marginRight,padding,paddingTop,paddingLeft,paddingBottom,paddingRight,top,left,bottom,right,width,height,maxWidth,maxHeight,minWidth,minHeight,borderRadius,borderWidth".split(",");
  /**
   * @param {Array<number|string>|number|string|undefined} value
   * @param {string} type
   * @returns {TweenValue}
   */
  static parseValue(value, type) {
    return type === _Tween.COLOR ? _Tween.parseColor(value) : _Tween.parseNumeric(value);
  }
  /**
   * @param {Array<number|string>|number|string|undefined} numeric
   * @returns {number|Array<number>}
   */
  static parseNumeric(numeric) {
    if (!Array.isArray(numeric)) {
      numeric = String(numeric).split(/\s+/);
    }
    return Array.isArray(numeric) ? numeric.map(parseFloat) : Number(numeric);
  }
  /**
   * @param {string} color
   * @returns {TweenColor|undefined}
   */
  static parseColor(color) {
    const hex = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hex) {
      return {
        r: parseInt(hex[1], 16),
        g: parseInt(hex[2], 16),
        b: parseInt(hex[3], 16),
        a: 1
      };
    }
    const rgb = color.match(
      /^rgba?\(([0-9.]*), ?([0-9.]*), ?([0-9.]*)(?:, ?([0-9.]*))?\)$/
    );
    if (rgb) {
      return {
        r: parseFloat(rgb[1]),
        g: parseFloat(rgb[2]),
        b: parseFloat(rgb[3]),
        a: parseFloat(rgb[4] != null ? rgb[4] : 1)
      };
    }
  }
  /**
   * @param {number} percent
   * @returns {TweenValue|string}
   */
  interpolate(percent) {
    if (this.type === _Tween.NUMERIC) {
      if (Array.isArray(this.end)) {
        return this.array(percent);
      } else if (this.end !== void 0) {
        return this.absolute(percent);
      }
    } else if (this.type === _Tween.COLOR) {
      return this.color(percent);
    }
  }
  /**
   * @param {number} percent
   * @returns {Array<number|string>}
   */
  array(percent) {
    const value = [];
    const start = (
      /** @type {Array<number>} */
      this.start
    );
    const end = (
      /** @type {Array<number>} */
      this.end
    );
    if (Array.isArray(end)) {
      for (let i = 0; i < end.length; ++i) {
        if (end[i] !== void 0) {
          value[i] = start[i] + end[i] * percent;
          if (this.suffix) {
            value[i] += this.suffix;
          }
        }
      }
    }
    return value;
  }
  /**
   * @param {number} percent
   * @returns {number|string}
   */
  absolute(percent) {
    let value = Number(this.start) + (Number(this.end) - Number(this.start)) * percent;
    if (this.suffix) {
      value = value + this.suffix;
    }
    return value;
  }
  /**
   * @param {number} percent
   * @returns {string}
   */
  color(percent) {
    const rgb = { r: 0, g: 0, b: 0 };
    let spectra, value;
    const start = (
      /** @type {TweenColor} */
      this.start
    );
    const end = (
      /** @type {TweenColor} */
      this.end
    );
    for (spectra in rgb) {
      const value2 = Math.round(
        start[spectra] + (end[spectra] - start[spectra]) * percent
      );
      rgb[spectra] = clamp(value2, 0, 255);
    }
    spectra = "a";
    value = Math.round(
      start[spectra] + (end[spectra] - start[spectra]) * percent
    );
    rgb[spectra] = clamp(value, 0, 1);
    return "rgba(" + [rgb.r, rgb.g, rgb.b, rgb.a] + ")";
  }
};
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// src/animations/animation.js
var Animation = class _Animation {
  /**
   * Creates new animation
  * @param {import("../item.js").Item} item Object to animate
  * @param {AnimationTransform} transform
   * @param {number} duration
   * @param {string} ease Timing function
   * @param {number} delay
   * @constructor
   */
  constructor(item, transform, duration, ease, delay) {
    this.item = item;
    this.transformation = transform;
    this.start = null;
    this.diff = null;
    this.state = {};
    this.duration = (transform.duration || duration) | 0;
    this.delay = (transform.delay || delay) | 0;
    ease = transform.ease || ease;
    this.ease = easings[ease] || easings.linear;
    this.easeName = transform.ease || ease || "linear";
  }
  static skip = { duration: null, delay: null, ease: null };
  static transform = { translate: null, rotate: null, scale: null };
  static getState(transform, item) {
    const initial = {};
    let computed;
    for (const property in transform) {
      if (property in _Animation.skip) continue;
      if (transform.hasOwnProperty(property)) {
        if (item.get(property) == null) {
          if (!computed) {
            computed = getComputedStyle(item.dom, null);
          }
          _Animation.setItemState(item, property, computed);
        }
        initial[property] = new Tween(
          item.get(property),
          transform[property],
          property
        );
      }
    }
    return initial;
  }
  static setItemState = function(item, property, computed) {
    if (property in _Animation.transform) {
      let value = computed[transformProperty];
      if (value === "none") {
        value = {
          translate: Vector.zero(),
          rotate: Vector.zero(),
          scale: Vector.set(1)
        };
      } else {
        value = Matrix.decompose(Matrix.parse(value));
      }
      item.set("translate", value.translate);
      item.set("rotate", value.rotate);
      item.set("scale", value.scale);
    } else {
      item.set(property, computed[property]);
    }
  };
  /**
   * Starts animation timer
   * @param {number} tick Timestamp
   * @param {boolean=} seek Is used in seek mode
   */
  init(tick, seek = false) {
    if (this.start !== null && !seek) return;
    if (this.start === null) {
      this.state = _Animation.getState(this.transformation, this.item);
    }
    this.start = tick + this.delay;
  }
  /**
   * Merges animation values
  * @param {AnimationTransform} transform
   * @param {number} duration
   * @param {string} ease Timing function
   * @param {number} delay
   */
  merge(transform, duration, ease, delay) {
    this.duration = (transform.duration || duration) | 0;
    this.delay = (transform.delay || delay) | 0;
    ease = transform.ease || ease;
    this.ease = easings[ease] || easings.linear;
    this.easeName = transform.ease || ease || "linear";
    merge(this.transformation, transform);
    this.start = null;
  }
  /**
   * Gets values from state params
   * @param {string} type
   */
  get(type) {
    return this.state[type];
  }
  /**
   * Runs one tick of animation
   * @param {number} tick
   * @param {boolean} seek Is used in seek mode
   */
  run(tick, seek) {
    if (this.start === null) return;
    const start = this.start;
    if (tick < start && !seek) return;
    let percent = 0;
    if (tick >= start) {
      percent = (tick - start) / this.duration;
      percent = this.ease(percent);
    }
    this.transform(percent);
  }
  /**
   * Pauses animation
   */
  pause() {
    this.diff = performance.now() - (this.start || 0);
  }
  /**
   * Resumes animation
   */
  resume() {
    this.start = performance.now() - (this.diff || 0);
  }
  interpolate(property, percent) {
    return this.get(property).interpolate(percent);
  }
  /**
   * Transforms item
   * @param {number} percent
   */
  transform(percent) {
    for (const property in this.state) {
      this.item.set(property, this.interpolate(property, percent));
    }
  }
  /**
   * Ends animation
   * @param {boolean} abort
   * @param {boolean} seek Is used in seek mode
   */
  end(abort, seek) {
    if (!abort) {
      this.transform(this.ease(1));
    }
    if (!seek) {
      this.start = null;
    }
  }
};

// src/animations/collection.js
var Collection = class _Collection extends EventEmitter {
  /**
   * Creates a set of animations
  * @param {import("../item.js").Item} item
  * @param {CollectionOptions=} options
   * @constructor
   */
  constructor(item, options = {}) {
    super();
    this.start = null;
    this.item = item;
    this.delay = 0;
    this.duration = 0;
    this.ease = easings.linear;
    this.easeName = "linear";
    this.animations = [];
    this.Sequence = options.Sequence;
    this.Parallel = options.Parallel;
  }
  /**
   * Add item to the collection
    * @param {AnimationInput} transform
    * @param {number=} duration
    * @param {string=} ease
    * @param {number=} delay
    * @param {boolean=} generated
    * @returns {this}
   */
  add(transform, duration, ease, delay, generated) {
    if (Array.isArray(transform)) {
      transform = parallel.call(this, this.item, transform);
    } else if (typeof transform == "string" || transform.name != void 0) {
      transform = new CssAnimation(
        this.item,
        transform,
        duration,
        ease,
        delay,
        generated
      );
    } else if (!(transform instanceof _Collection)) {
      transform = new Animation(this.item, transform, duration, ease, delay);
    }
    this.animations.push(transform);
    const durations = this.animations.map(function(a) {
      return a.duration + a.delay;
    });
    if (this.constructor === this.Parallel) {
      this.duration = Math.max.apply(null, durations);
    } else {
      this.duration = durations.reduce(function(a, b) {
        return a + b;
      }, 0);
    }
    return this;
    function sequence(item, transforms) {
      const sequence2 = new this.Sequence(item, {
        native: false,
        Sequence: this.Sequence,
        Parallel: this.Parallel
      });
      transforms.forEach(function(t) {
        sequence2.add(t, duration, ease, delay);
      });
      return sequence2;
    }
    function parallel(item, transforms) {
      const parallel2 = new this.Parallel(item, {
        Sequence: this.Sequence,
        Parallel: this.Parallel
      });
      transforms.forEach(function(t) {
        if (Array.isArray(t)) {
          parallel2.add(sequence.call(this, item, t));
        } else {
          parallel2.add(t, duration, ease, delay);
        }
      }, this);
      return parallel2;
    }
  }
  /**
   * Collection length
   */
  get length() {
    return this.animations.length;
  }
  /**
   * Get element by index
   * @param {number} index
   * @returns {Animation | Parallel}
   */
  get(index) {
    return this.animations[index];
  }
  /**
   * Remove all elements from collection
   */
  empty() {
    this.animations = [];
  }
  /**
   * Add animation to collection
   * chainable
    * @param {AnimationInput} transform
    * @param {number=} duration
    * @param {string=} ease
    * @param {number=} delay
    * @returns {Collection}
   */
  animate(transform, duration, ease, delay) {
    return this.add(transform, duration, ease, delay);
  }
  /**
   * Apply styles
   * @param {boolean=} idle
  * @returns {import("../css.js").CSS}
   */
  css(idle = false) {
    return this.item.css(idle);
  }
};

// src/animations/parallel.js
var Parallel = class extends Collection {
  /**
   * Creates a set of parallel animations
    * @param {import("../item.js").Item} item
    * @param {{Sequence?: Function, Parallel?: Function}=} options
   * @constructor
   */
  constructor(item, options = {}) {
    super(item, options);
  }
  /**
   * Calls a method on all animations
   * @param {string} method
  * @param {...unknown} args
   */
  all(method, ...args) {
    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i];
      const callable = (
        /** @type {Record<string, (...args: Array<unknown>) => unknown>} */
        /** @type {unknown} */
        a
      );
      callable[method].apply(a, args);
    }
  }
  /**
   * Initializes all animations in a set
   * @param {number} tick
   * @param {boolean=} force Force initialization
   * @fires Parallel#start
   */
  init(tick, force) {
    if (this.start !== null && !force) return;
    this.start = tick;
    this.all("init", tick, force);
    this.emit("start");
  }
  /**
   * Runs one tick of animations
   * @param {number} tick
   */
  run(tick) {
    if (!this.animations.length) return;
    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i];
      if ((a.start || 0) + a.duration <= tick) {
        this.animations.splice(i--, 1);
        a.end(false, false);
        continue;
      }
      a.run(tick, false);
    }
    this.item.style();
    if (!this.animations.length) {
      this.end();
    }
  }
  /**
   * Seeks to the animation tick
   * @param {number} tick
   */
  seek(tick) {
    this.run(tick);
  }
  /**
   * Pauses animations
   */
  pause() {
    this.all("pause");
  }
  /**
   * Resumes animations
   */
  resume() {
    this.all("resume");
  }
  /**
   * Ends all animations in a set
   * @param {boolean} abort
   * @fires Parallel#end
   */
  end(abort = false) {
    this.all("end", abort);
    this.emit("end");
  }
};

// src/waapi/effect.js
var frameInterval = 1e3 / 60;
var transformProperties = {
  translate: true,
  rotate: true,
  scale: true
};
var skippedProperties = {
  duration: true,
  delay: true,
  ease: true
};
function canUseWaapi(sequence) {
  return !containsCssAnimation(sequence) && sequence.length > 0;
}
function buildEffect(sequence) {
  const properties = collectProperties(sequence);
  const item = sequence.item;
  ensureItemState(item, properties);
  const baseState = cloneState(item.state);
  const duration = Math.max(sequence.duration, 0);
  const times = collectTimes(sequence, duration);
  const keyframes = times.map(function(time) {
    const state = evaluate(sequence, baseState, time);
    return frame(state, properties, duration ? time / duration : 1);
  });
  if (keyframes.length === 1) {
    keyframes.unshift(frame(baseState, properties, 0));
  }
  return {
    duration,
    finalState: evaluate(sequence, baseState, duration),
    keyframes,
    properties,
    /** @param {number} time */
    stateAt(time) {
      const localTime = duration ? clamp2(time, 0, duration) : 0;
      return evaluate(sequence, baseState, localTime);
    },
    timing: {
      duration,
      fill: "forwards",
      iterations: sequence._infinite ? Infinity : 1
    }
  };
}
function applyState(item, state) {
  const applied = (
    /** @type {AppliedState} */
    state
  );
  if (applied.state) {
    item.state = cloneState(applied.state);
    if (applied.current) {
      item.current = cloneBodyState(applied.current);
    }
    if (applied.previous) {
      item.previous = cloneBodyState(applied.previous);
    }
    if (applied.clock !== void 0 && item.timelineControlled) {
      item.clock = applied.clock;
    } else if (applied.clock !== void 0) {
      item.clock = null;
    }
  } else {
    item.state = cloneState(
      /** @type {AnimationState} */
      state
    );
  }
  item.style();
}
function commitComputedState(item, properties) {
  const computed = getComputedStyle(item.dom, null);
  let transform;
  properties.forEach(function(property) {
    if (property in transformProperties) {
      transform ||= computedTransform(computed);
      item.set("translate", transform.translate);
      item.set("rotate", transform.rotate);
      item.set("scale", transform.scale);
      if (item.current && item.previous) {
        item.current.position = cloneValue(transform.translate);
        item.previous.position = cloneValue(transform.translate);
      }
    } else {
      const computedValue = (
        /** @type {Record<string, string>} */
        /** @type {unknown} */
        computed[property]
      );
      item.set(property, computedValue);
    }
  });
  item.style();
}
function containsCssAnimation(node) {
  if (isCssAnimation(node)) return true;
  if (!node.animations) return false;
  return node.animations.some(containsCssAnimation);
}
function collectProperties(node, properties = []) {
  if (node.transformation) {
    Object.keys(node.transformation).forEach(function(property) {
      if (!(property in skippedProperties) && properties.indexOf(property) === -1) {
        properties.push(property);
      }
    });
  }
  if (node.animations) {
    node.animations.forEach(function(animation) {
      collectProperties(animation, properties);
    });
  }
  return properties;
}
function collectTimes(sequence, duration) {
  const times = [0, duration];
  addTimes(sequence, 0, times);
  for (let time = frameInterval; time < duration; time += frameInterval) {
    addTime(times, time);
  }
  return times.sort(function(a, b) {
    return a - b;
  });
}
function addTimes(node, start, times) {
  if (node.transformation) {
    const delay = node.delay || 0;
    const duration = node.duration || 0;
    addTime(times, start);
    addTime(times, start + delay);
    addTime(times, start + delay + duration);
    return;
  }
  if (!node.animations) return;
  if (isParallel(node)) {
    node.animations.forEach(function(animation) {
      addTimes(animation, start, times);
    });
    return;
  }
  let cursor = start;
  node.animations.forEach(function(animation) {
    addTimes(animation, cursor, times);
    cursor += totalDuration(animation);
  });
}
function addTime(times, time) {
  if (times.indexOf(time) === -1) {
    times.push(time);
  }
}
function ensureItemState(item, properties) {
  let computed;
  let transformSet = false;
  properties.forEach(function(property) {
    if (item.get(property) != null) return;
    computed ||= getComputedStyle(item.dom, null);
    if (property in transformProperties) {
      if (!transformSet) {
        Animation.setItemState(item, property, computed);
        transformSet = true;
      }
    } else {
      Animation.setItemState(item, property, computed);
    }
  });
}
function evaluate(node, baseState, time) {
  if (node.transformation) {
    return evaluateAnimation(node, baseState, time);
  }
  if (isParallel(node)) {
    return evaluateParallel(node, baseState, time);
  }
  return evaluateSequence(node, baseState, time);
}
function evaluateSequence(sequence, baseState, time) {
  let state = cloneState(baseState);
  let cursor = 0;
  const animations = sequence.animations || [];
  for (let i = 0; i < animations.length; ++i) {
    const animation = animations[i];
    const duration = totalDuration(animation);
    if (time < cursor) {
      break;
    }
    if (time >= cursor + duration) {
      state = evaluate(animation, state, duration);
      cursor += duration;
    } else {
      state = evaluate(animation, state, time - cursor);
      break;
    }
  }
  return state;
}
function evaluateParallel(parallel, baseState, time) {
  const state = cloneState(baseState);
  const animations = parallel.animations || [];
  animations.forEach(function(animation) {
    const animationState = evaluate(animation, baseState, time);
    applyAffectedState(state, animationState, affectedProperties(animation));
  });
  return state;
}
function evaluateAnimation(animation, baseState, time) {
  const state = cloneState(baseState);
  const delay = animation.delay || 0;
  const duration = animation.duration || 0;
  const ease = typeof animation.ease === "function" ? animation.ease : linear;
  const transformation = animation.transformation || {};
  const localTime = clamp2(time - delay, 0, duration);
  const percent = duration ? ease(localTime / duration) : 1;
  Object.keys(transformation).forEach(function(property) {
    if (property in skippedProperties) return;
    const tween = new Tween(
      baseState[property],
      transformation[property],
      property
    );
    const value = tween.interpolate(percent);
    setState(state, property, value);
  });
  return state;
}
function affectedProperties(node, affected = {}) {
  if (node.transformation) {
    const transformation = node.transformation;
    Object.keys(transformation).forEach(function(property) {
      if (property in skippedProperties) return;
      const value = transformation[property];
      if (Array.isArray(value)) {
        const indexes = (
          /** @type {Array<number>} */
          affected[property] ||= []
        );
        value.forEach(function(entry, index) {
          if (entry && indexes.indexOf(index) === -1) {
            indexes.push(index);
          }
        });
      } else {
        affected[property] = null;
      }
    });
  }
  if (node.animations) {
    node.animations.forEach(function(animation) {
      affectedProperties(animation, affected);
    });
  }
  return affected;
}
function applyAffectedState(state, source, affected) {
  Object.keys(affected).forEach(function(property) {
    const indexes = affected[property];
    if (Array.isArray(indexes)) {
      const target = Array.isArray(state[property]) ? state[property] : [];
      const sourceValue = source[property];
      state[property] = target;
      indexes.forEach(function(index) {
        if (Array.isArray(sourceValue)) {
          target[index] = sourceValue[index];
        }
      });
    } else {
      state[property] = cloneValue(source[property]);
    }
  });
}
function setState(state, property, value) {
  if (Array.isArray(value)) {
    const target = Array.isArray(state[property]) ? state[property] : [];
    state[property] = target;
    value.forEach(function(entry, index) {
      if (entry !== void 0) {
        target[index] = entry;
      }
    });
  } else {
    state[property] = value;
  }
}
function frame(state, properties, offset, translate = state.translate) {
  const keyframe = {
    offset: clamp2(offset, 0, 1),
    easing: "linear"
  };
  if (usesTransform(properties)) {
    keyframe[transformProperty] = Matrix.stringify(
      Matrix.compose(
        toNumberArray(translate),
        toNumberArray(state.rotate),
        toNumberArray(state.scale)
      )
    );
  }
  properties.forEach(function(property) {
    if (property in transformProperties) return;
    keyframe[property] = Array.isArray(state[property]) ? state[property].join(" ") : state[property];
  });
  return keyframe;
}
function usesTransform(properties) {
  return properties.some(function(property) {
    return property in transformProperties;
  });
}
function totalDuration(animation) {
  return (animation.delay || 0) + (animation.duration || 0);
}
function isCssAnimation(animation) {
  return animation.name !== void 0 && !animation.transformation;
}
function isParallel(collection) {
  return !!(collection.constructor && collection.constructor.name === "Parallel");
}
function cloneState(state) {
  const clone = {};
  Object.keys(state).forEach(function(property) {
    clone[property] = cloneValue(state[property]);
  });
  return clone;
}
function cloneValue(value) {
  return Array.isArray(value) ? (
    /** @type {T} */
    value.slice()
  ) : value;
}
function clamp2(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function computedTransform(computed) {
  const transform = (
    /** @type {Record<string, string>} */
    /** @type {unknown} */
    computed[transformProperty]
  );
  if (transform === "none") {
    return {
      translate: [0, 0, 0],
      rotate: [0, 0, 0],
      scale: [1, 1, 1]
    };
  }
  return Matrix.decompose(Matrix.parse(transform));
}
function cloneBodyState(body) {
  return {
    position: cloneValue(body.position),
    velocity: cloneValue(body.velocity),
    acceleration: cloneValue(body.acceleration)
  };
}
function toNumberArray(value) {
  return Array.isArray(value) ? value.map(Number) : [];
}
function linear(percent) {
  return percent;
}

// src/physics/forces/constant.js
function Constant(item) {
  const force = Vector.sub(item.state.translate, item.current.position);
  item.current.acceleration = Vector.add(item.current.acceleration, force);
}

// src/physics/forces/edge.js
function Edge(item, min = Vector.set(0), max = Vector.set(0), bounce = true) {
  for (let i = 0; i < 3; ++i) {
    if (item.current.position[i] < min[i] || item.current.position[i] > max[i]) {
      const position = Math.max(min[i], Math.min(max[i], item.current.position[i]));
      if (bounce) {
        item.previous.position[i] = position + item.current.position[i] - item.previous.position[i];
        item.current.position[i] = position;
      } else {
        item.current.position[i] = position;
      }
    }
  }
}

// src/physics/verlet.js
function Verlet(self, delta, drag) {
  const current = self.current;
  const previous = self.previous;
  current.acceleration = Vector.scale(current.acceleration, self.mass);
  current.velocity = Vector.sub(current.position, previous.position);
  if (drag !== void 0) {
    current.velocity = Vector.scale(current.velocity, drag);
  }
  previous.position = current.position;
  current.position = Vector.add(
    current.position,
    Vector.add(
      current.velocity,
      Vector.scale(current.acceleration, delta * delta)
    )
  );
  current.acceleration = Vector.zero();
}

// src/waapi/physics.js
function canUsePhysicsWaapi(sequence) {
  const item = sequence.item;
  return isPhysicsItem(item) && item.physicsMode !== "live" && !sequence._infinite && sequence.length > 0 && !containsCssAnimation(sequence);
}
function buildPhysicsEffect(sequence) {
  const item = sequence.item;
  const properties = collectProperties(sequence);
  ensureItemState(item, properties);
  const baseState = cloneState(item.state);
  const duration = Math.max(sequence.duration, 0);
  const samples = sample(sequence, baseState, duration);
  const keyframes = samples.map(function(sample2) {
    return frame(
      sample2.state,
      properties,
      duration ? sample2.time / duration : 1,
      sample2.current.position
    );
  });
  if (keyframes.length === 1) {
    keyframes.unshift(frame(baseState, properties, 0, item.current.position));
  }
  return {
    duration,
    finalState: snapshotState(samples[samples.length - 1]),
    keyframes,
    properties,
    /** @param {number} time */
    stateAt(time) {
      return interpolateSamples(samples, duration ? clamp2(time, 0, duration) : 0);
    },
    timing: {
      duration,
      fill: "forwards",
      iterations: 1
    }
  };
}
function isPhysicsItem(item) {
  const candidate = (
    /** @type {{current?: unknown, previous?: unknown, integrate?: unknown}} */
    item
  );
  return !!candidate.current && !!candidate.previous && typeof candidate.integrate === "function";
}
function sample(sequence, baseState, duration) {
  const simulation = createSimulation(sequence.item, baseState);
  const samples = [];
  let previousTime = 0;
  addSample(samples, 0, simulation);
  for (let time = frameInterval; time < duration; time += frameInterval) {
    advance(sequence, baseState, simulation, previousTime, time);
    addSample(samples, time, simulation);
    previousTime = time;
  }
  if (duration) {
    advance(sequence, baseState, simulation, previousTime, duration);
    addSample(samples, duration, simulation);
  }
  return samples;
}
function createSimulation(item, baseState) {
  return {
    state: (
      /** @type {PhysicsState} */
      cloneState(baseState)
    ),
    mass: item.mass,
    viscosity: item.viscosity,
    edge: item.edge || null,
    current: cloneBodyState2(item.current),
    previous: cloneBodyState2(item.previous)
  };
}
function advance(sequence, baseState, simulation, from, to) {
  let time = from;
  while (time < to) {
    const next = Math.min(time + frameInterval, to);
    simulation.state = /** @type {PhysicsState} */
    evaluate(
      /** @type {Parameters<typeof evaluate>[0]} */
      sequence,
      baseState,
      next
    );
    integrate(simulation, next - time);
    time = next;
  }
}
function integrate(simulation, delta) {
  if (!delta) return;
  Constant(simulation);
  if (simulation.edge) {
    Edge(
      simulation,
      Vector.set(simulation.edge.min),
      Vector.set(simulation.edge.max),
      simulation.edge.bounce
    );
  }
  Verlet(simulation, delta * 1e-3, 1 - simulation.viscosity);
  if (simulation.edge) {
    Edge(
      simulation,
      Vector.set(simulation.edge.min),
      Vector.set(simulation.edge.max),
      simulation.edge.bounce
    );
  }
}
function addSample(samples, time, simulation) {
  samples.push({
    time,
    state: cloneState(simulation.state),
    current: cloneBodyState2(simulation.current),
    previous: cloneBodyState2(simulation.previous)
  });
}
function interpolateSamples(samples, time) {
  if (time <= samples[0].time) {
    return snapshotState(samples[0]);
  }
  const last = samples[samples.length - 1];
  if (time >= last.time) {
    return snapshotState(last);
  }
  for (let i = 1; i < samples.length; ++i) {
    const next = samples[i];
    if (time <= next.time) {
      const previous = samples[i - 1];
      const percent = (time - previous.time) / (next.time - previous.time);
      return {
        time,
        state: interpolateState(previous.state, next.state, percent),
        current: interpolateBody(previous.current, next.current, percent),
        previous: interpolateBody(previous.previous, next.previous, percent),
        clock: time
      };
    }
  }
  return snapshotState(last);
}
function snapshotState(sample2) {
  return {
    time: sample2.time,
    state: cloneState(sample2.state),
    current: cloneBodyState2(sample2.current),
    previous: cloneBodyState2(sample2.previous),
    clock: sample2.time
  };
}
function interpolateState(from, to, percent) {
  const state = {};
  const properties = Object.keys(from).concat(
    Object.keys(to).filter(function(property) {
      return !(property in from);
    })
  );
  properties.forEach(function(property) {
    state[property] = interpolateValue(from[property], to[property], percent);
  });
  return state;
}
function interpolateBody(from, to, percent) {
  return {
    position: interpolateArray(from.position, to.position, percent),
    velocity: interpolateArray(from.velocity, to.velocity, percent),
    acceleration: interpolateArray(from.acceleration, to.acceleration, percent)
  };
}
function interpolateValue(from, to, percent) {
  if (Array.isArray(from) && Array.isArray(to)) {
    return interpolateArray(from, to, percent);
  }
  if (typeof from === "number" && typeof to === "number") {
    return from + (to - from) * percent;
  }
  return percent < 1 ? cloneValue(from) : cloneValue(to);
}
function interpolateArray(from, to, percent) {
  return from.map(function(value, index) {
    const end = to[index];
    if (typeof value === "number" && typeof end === "number") {
      return value + (end - value) * percent;
    }
    return percent < 1 ? value : end;
  });
}
function cloneBodyState2(body) {
  return {
    position: body.position.slice(),
    velocity: body.velocity.slice(),
    acceleration: body.acceleration.slice()
  };
}

// src/waapi/sequence.js
var WaapiSequenceController = class {
  /**
   * @param {import("../animations/sequence.js").Sequence & {item: import("../item.js").Item & {timelineControlled?: boolean, nativeAnimations?: boolean}}} sequence
   * @param {boolean=} enabled
   */
  constructor(sequence, enabled = true) {
    this.sequence = sequence;
    this.enabled = enabled;
    this.effect = null;
    this.player = null;
    this.scheduled = false;
  }
  /**
   * @returns {boolean}
   */
  handlesPlayback() {
    return this.supported() && !!(this.scheduled || this.player || this.sequence.item.timelineControlled);
  }
  /**
   * @returns {boolean}
   */
  supported() {
    const item = this.sequence.item;
    return this.enabled && item.nativeAnimations !== false && item.dom && typeof item.dom.animate === "function" && canUseNativeEffect(this.sequence);
  }
  /**
   * @returns {boolean}
   */
  schedule() {
    if (!this.supported() || this.sequence.item.timelineControlled) {
      return false;
    }
    if (this.player) {
      this.invalidate();
    }
    if (this.scheduled) {
      return true;
    }
    this.scheduled = true;
    defer(() => {
      if (!this.scheduled) return;
      this.scheduled = false;
      this.play();
    });
    return true;
  }
  /**
   * @returns {boolean}
   */
  play() {
    if (!this.supported() || this.sequence.item.timelineControlled) {
      return false;
    }
    if (!this.player) {
      this.createPlayer(false);
    } else {
      this.player.play();
    }
    return true;
  }
  /**
   * @param {number} time
   * @returns {boolean}
   */
  seek(time) {
    if (!this.supported()) {
      return false;
    }
    if (!this.player) {
      this.createPlayer(true);
    }
    const currentTime = this.localTime(time);
    if (!this.player) {
      if (this.effect) {
        applyState(this.sequence.item, this.effect.stateAt(currentTime));
      }
      return true;
    }
    this.player.currentTime = currentTime;
    this.player.pause();
    if (this.effect) {
      applyState(this.sequence.item, this.effect.stateAt(currentTime));
    }
    return true;
  }
  /**
   * @returns {boolean}
   */
  pause() {
    if (!this.handlesPlayback()) {
      return false;
    }
    this.scheduled = false;
    if (this.player) {
      this.player.pause();
    }
    return true;
  }
  /**
   * @returns {boolean}
   */
  resume() {
    if (!this.supported() || this.sequence.item.timelineControlled) {
      return false;
    }
    return this.play();
  }
  /**
   * @param {boolean=} abort
   * @returns {boolean}
   */
  finish(abort = false) {
    if (!this.handlesPlayback() && !this.supported()) {
      return false;
    }
    this.scheduled = false;
    if (!this.effect && !abort) {
      this.effect = buildNativeEffect(this.sequence);
    }
    if (abort) {
      if (this.effect) {
        commitComputedState(this.sequence.item, this.effect.properties);
      }
    } else if (this.effect) {
      applyState(this.sequence.item, this.effect.finalState);
    }
    this.cancelPlayer();
    this.complete();
    return true;
  }
  /**
   * @returns {void}
   */
  cancel() {
    this.scheduled = false;
    this.cancelPlayer();
    this.effect = null;
  }
  /**
   * @returns {void}
   */
  invalidate() {
    if (this.player && this.effect) {
      commitComputedState(this.sequence.item, this.effect.properties);
    }
    this.cancelPlayer();
    this.effect = null;
    this.schedule();
  }
  /**
   * @param {boolean} paused
   * @returns {void}
   */
  createPlayer(paused) {
    this.effect = buildNativeEffect(this.sequence);
    const effect = this.effect;
    if (!effect.duration) {
      applyState(this.sequence.item, effect.finalState);
      if (!paused || !this.sequence.item.timelineControlled) {
        this.complete();
      }
      return;
    }
    this.player = this.sequence.item.dom.animate(
      effect.keyframes,
      effect.timing
    );
    if (paused) {
      this.player.pause();
    }
    this.player.onfinish = () => {
      if (!this.player || effect.timing.iterations === Infinity) return;
      applyState(this.sequence.item, effect.finalState);
      this.cancelPlayer();
      this.complete();
    };
  }
  /**
   * @param {number} time
   * @returns {number}
   */
  localTime(time) {
    if (!this.effect || !this.effect.duration) {
      return 0;
    }
    if (this.sequence._infinite) {
      return time % this.effect.duration;
    }
    return Math.min(this.effect.duration, Math.max(0, time));
  }
  /**
   * @returns {void}
   */
  cancelPlayer() {
    if (this.player) {
      this.player.onfinish = null;
      this.player.cancel();
      this.player = null;
    }
  }
  /**
   * @returns {void}
   */
  complete() {
    this.effect = null;
    this.sequence.animations = [];
    this.sequence._infinite = false;
    this.sequence.emit("end");
  }
};
function defer(callback) {
  if (typeof queueMicrotask === "function") {
    queueMicrotask(callback);
  } else {
    Promise.resolve().then(callback);
  }
}
function canUseNativeEffect(sequence) {
  if (isPhysicsItem(sequence.item)) {
    return canUsePhysicsWaapi(
      /** @type {import("./physics.js").PhysicsSequence} */
      sequence
    );
  }
  return canUseWaapi(sequence);
}
function buildNativeEffect(sequence) {
  return isPhysicsItem(sequence.item) ? buildPhysicsEffect(
    /** @type {import("./physics.js").PhysicsSequence} */
    sequence
  ) : buildEffect(sequence);
}

// src/animations/sequence.js
var Sequence = class _Sequence extends Collection {
  /**
   * Creates a set of parallel animations
  * @param {import("../item.js").Item} item
  * @param {SequenceOptions=} options
   * @constructor
   */
  constructor(item, options = {}) {
    super(item, {
      Sequence: options.Sequence || _Sequence,
      Parallel: options.Parallel || Parallel
    });
    this._infinite = false;
    this.native = new WaapiSequenceController(this, options.native !== false);
  }
  /**
   * Add item to the sequence
  * @param {Object|Array<unknown>|string|Collection} transform
   * @param {number=} duration
   * @param {string=} ease
   * @param {number=} delay
   * @param {boolean=} generated
  * @returns {this}
   */
  add(transform, duration, ease, delay, generated) {
    super.add(transform, duration, ease, delay, generated);
    this.native.schedule();
    return this;
  }
  empty() {
    this.native.cancel();
    super.empty();
  }
  /**
   * Initializes all animations in a set
   * @param {number} tick
   * @param {boolean=} force Force initialization
   * @fires Sequence#start
   */
  init(tick, force) {
    if (this.start !== null && !force) return;
    this.start = tick;
    this.animations[0].init(tick, force);
    this.emit("start");
  }
  /**
   * Runs one tick of animations
   * @param {number} tick
   */
  run(tick) {
    if (this.native.play()) return;
    if (!this.animations.length) return;
    let a;
    while (this.animations.length !== 0) {
      a = this.animations[0];
      if (a instanceof CssAnimation) {
        a._infinite = this._infinite;
      }
      a.init(tick);
      if (a.start + a.duration <= tick) {
        if (!(this._infinite && a instanceof CssAnimation)) {
          this.animations.shift();
          a.end();
        } else {
          break;
        }
        if (this._infinite && !(a instanceof CssAnimation)) {
          this.animations.push(a);
        }
        continue;
      }
      a.run(tick);
      break;
    }
    if (!(a instanceof CssAnimation)) {
      this.item.style();
    }
    if (!this.animations.length) {
      this.end();
    }
  }
  /**
   * Seeks animations
   * @param {number} tick
   */
  seek(tick) {
    if (this.native.seek(tick)) return;
    if (this.animations.length === 0) return;
    let time = 0;
    for (let i = 0; i < this.animations.length; ++i) {
      const a = this.animations[i];
      a.init(time, true);
      if (a.start + a.duration <= tick) {
        time += a.delay + a.duration;
        a.end(false, true);
        continue;
      } else {
        a.run(tick, true);
      }
      break;
    }
    this.item.style();
  }
  /**
   * Play animation infinitely
   * @returns {Sequence}
   */
  infinite() {
    this._infinite = true;
    this.native.invalidate();
    return this;
  }
  /**
   * Pauses animations
   */
  pause() {
    if (this.native.pause()) return;
    if (this.animations.length) {
      this.animations[0].pause();
    }
  }
  /**
   * Resumes animations
   */
  resume() {
    if (this.native.resume()) return;
    if (this.animations.length) {
      this.animations[0].resume();
    }
  }
  /**
   * Ends all animations in a set
   * @param {boolean} abort
   * @fires Sequence#end
   */
  end(abort = false) {
    if (this.native.finish(abort)) return;
    for (let i = 0; i < this.animations.length; ++i) {
      this.animations[i].end(abort);
    }
    this.animations = [];
    this._infinite = false;
    this.emit("end");
  }
};

// src/css.js
var CSS = class _CSS {
  /**
   * CSSify animations
  * @param {import("./item.js").Item} item
   * @param {boolean=} idle
   * @constructor
   */
  constructor(item, idle) {
    if (!document.styleSheets.length) {
      this.createStyleSheet();
    }
    this.stylesheet = document.styleSheets[0];
    this.item = item;
    this.animation = item.animation;
    if (!idle) {
      this.style();
    }
  }
  /**
   * Creates new stylesheet and adds it to HEAD
   */
  createStyleSheet() {
    const style = document.createElement("style");
    document.getElementsByTagName("head")[0].appendChild(style);
  }
  /**
   * Pauses CSS animation
   */
  pause() {
    this.animation.pause();
  }
  /**
   * Resumes CSS animation
   */
  resume() {
    this.animation.resume();
  }
  /**
   * Stops CSS animation
   * parses current transformation matrix
   * extracts values and sets item state
   */
  stop() {
    const computed = getComputedStyle(this.item.dom, null), transform = computed[transformProperty];
    this.item.style(animationProperty, "");
    this.item.state = Matrix.decompose(Matrix.parse(transform));
    this.item.style();
    return this;
  }
  /**
   * Applies animations and sets item style
   */
  style() {
    if (containsCssAnimation(this.animation)) {
      throw new Error("CSS generation is not supported for named CSS animations");
    }
    const animation = "a" + Date.now() + "r" + Math.floor(Math.random() * 1e3);
    const effect = buildEffect(this.animation);
    const cssRules = this.stylesheet.cssRules;
    this.stylesheet.insertRule(
      this.keyframes(animation, effect),
      cssRules ? cssRules.length : 0
    );
    this.animation.empty();
    this.animation.add(animation, effect.duration, "", 0, true);
  }
  /**
   * Generates @keyframes based on animations
   * @param {string} name Animation name
   * @param {ReturnType<typeof buildEffect>=} effect
   * @return {string}
   */
  keyframes(name, effect) {
    if (!effect) {
      if (containsCssAnimation(this.animation)) {
        throw new Error(
          "CSS generation is not supported for named CSS animations"
        );
      }
      effect = buildEffect(this.animation);
    }
    const rule = ["@" + getProperty("keyframes") + " " + name + "{"];
    effect.keyframes.forEach((keyframe, index) => {
      rule.push(this.frame(keyframe, index < effect.keyframes.length - 1));
    });
    rule.push("}");
    return rule.join("");
  }
  /**
   * Calcuates percent for keyframes
   * @param {number} offset
   * @return {string}
   */
  percent(offset) {
    return (offset * 100).toFixed(3);
  }
  /**
   * Generates one frame for @keyframes
  * @param {Record<string, string|number|undefined>} keyframe
   * @param {boolean} withEasing
   * @return {string}
   */
  frame(keyframe, withEasing) {
    const percent = this.percent(keyframe.offset || 0);
    const props = [];
    for (const property in keyframe) {
      if (property in _CSS.skip) continue;
      props.push(this.property(property) + ":" + keyframe[property] + ";");
    }
    if (withEasing && keyframe.easing) {
      props.push(
        getProperty("animation-timing-function") + ":" + keyframe.easing + ";"
      );
    }
    return percent + "% {" + props.join("") + "}";
  }
  property(property) {
    return property === transformProperty || property.indexOf("--") === 0 ? property : property.replace(/([A-Z])/g, "-$1").toLowerCase();
  }
};
CSS.skip = {
  offset: null,
  easing: null
};

// src/item.js
var Item = class extends EventEmitter {
  /**
   * Creates new animated item
   * @param {HTMLElement} node
   */
  constructor(node) {
    super();
    this.dom = node;
    this.animation = new Sequence(this);
    this.running = true;
    this.timelineControlled = false;
    this.state = {};
  }
  /**
   * Updates item on frame
   * @param {number} tick
   */
  update(tick) {
    if (!this.running) return;
    if (this.animation.native.handlesPlayback()) return;
    this.animation.run(tick);
  }
  /**
   * Updates item on timeline
   * @param {number} tick
   */
  timeline(tick) {
    if (this.animation.native.seek(tick)) return;
    this.clear();
    this.animation.seek(tick);
  }
  /**
   * Pauses item animation
   */
  pause() {
    if (!this.running) return;
    this.animation.pause();
    this.running = false;
  }
  /**
   * Resumes item animation
   */
  resume() {
    if (this.running) return;
    this.animation.resume();
    this.running = true;
  }
  /**
   * Sets style to the dom node
   * @param {string=} property
   * @param {string=} value
   */
  style(property, value) {
    const style = this.dom.style;
    if (property && value) {
      style[property] = value;
    } else {
      style[transformProperty] = this.transform();
      for (const property2 in this.state) {
        style[property2] = this.get(property2);
      }
    }
  }
  /**
   * Returns transform CSS value
   * @return {string}
   */
  transform() {
    return Matrix.stringify(this.matrix());
  }
  /**
   * Calculates transformation matrix for the state
  * @returns {Array<number>}
   */
  matrix() {
    const state = this.state;
    return Matrix.compose(state.translate, state.rotate, state.scale);
  }
  /**
   * Gets transformation needed to make Item in center
  * @returns {{translate: Array<number>, rotate: Array<number>, scale: Array<number>}}
   */
  center() {
    return Matrix.decompose(Matrix.inverse(this.matrix()));
  }
  /**
   * Rotates item to look at vector
   * @param {Array} vector
   */
  lookAt(vector) {
    const transform = Matrix.decompose(
      Matrix.lookAt(vector, this.get("translate"), Vector.set(0, 1, 0))
    );
    this.set("rotate", transform.rotate);
  }
  /**
   * Sets values to state params
   * @param {string} type
   * @param {Array|Number|String} value
   * @return {Item}
   */
  set(type, value) {
    if (Array.isArray(value)) {
      this.state[type] ||= [];
      for (let i = 0; i < value.length; ++i) {
        if (value[i] !== void 0) {
          this.state[type][i] = value[i];
        }
      }
    } else {
      this.state[type] = value;
    }
    return this;
  }
  /**
   * Gets values from state params
   * @param {string} type
   */
  get(type) {
    return this.state[type];
  }
  /**
   * Clears item transform
   */
  clear() {
    this.state.translate = Vector.zero();
    this.state.rotate = Vector.zero();
    this.state.scale = Vector.set(1);
  }
  /**
   * Adds animation
   * @param {Object|Array} transform
   * @param {number} duration
   * @param {string} ease
   * @param {number} delay
   * @return {Sequence}
   */
  animate(transform, duration, ease, delay) {
    return this.animation.add(transform, duration, ease, delay);
  }
  /**
   * Alternates current animation
   * @param {Object|Array} transform
   * @param {number} duration
   * @param {string} ease
   * @param {number} delay
   */
  alternate(transform, duration, ease, delay) {
    if (this.animation.length) {
      const a = this.animation.get(0);
      if (a instanceof Collection) {
        return;
      }
      a.merge(transform, duration, ease, delay);
      this.animation.native.invalidate();
    } else {
      this.animate.call(this, transform, duration, ease, delay);
    }
  }
  /**
   * Finishes all Item animations
   * @param {boolean=} abort
   */
  finish(abort = false) {
    this.animation.end(abort);
    return this;
  }
  /**
   * Stops all Item animations
   */
  stop() {
    return this.finish(true);
  }
  /**
   * Generates CSS animation or transition
   * @param {boolean=} idle
   * @return {CSS}
   */
  css(idle = false) {
    return new CSS(this, idle);
  }
};

// src/physics/particle.js
var Particle = class extends Item {
  /**
   * Creates particle with physics
   * @param {HTMLElement} node
  * @param {number | ParticleOptions} mass
  * @param {number=} viscosity
  * @param {PhysicsEdge=} edge
   * @constructor
   */
  constructor(node, mass, viscosity, edge) {
    super(node);
    let physicsMode;
    let particleMass;
    if (typeof mass === "object") {
      physicsMode = mass.physics;
      viscosity = mass.viscosity || viscosity;
      edge = mass.edge || edge;
      particleMass = mass.mass;
    } else {
      particleMass = mass / 100;
    }
    particleMass ||= 0.01;
    viscosity ||= 0.1;
    edge ||= null;
    this.mass = 1 / particleMass;
    this.viscosity = viscosity;
    this.edge = edge;
    this.current = {
      position: Vector.zero(),
      velocity: Vector.zero(),
      acceleration: Vector.zero()
    };
    this.previous = {
      position: Vector.zero(),
      velocity: Vector.zero(),
      acceleration: Vector.zero()
    };
    this.clock = null;
    this.physicsMode = physicsMode || "auto";
    this.nativeAnimations = this.physicsMode !== "live";
  }
  /**
   * Updates particle and applies integration
   * @param {number} tick
   */
  update(tick) {
    if (this.animation.native.handlesPlayback()) return;
    this.animation.run(tick);
    if (this.animation.native.handlesPlayback()) return;
    this.integrate(tick);
    this.style();
  }
  /**
   * Updates particle on timeline
   * @param {number} tick
   */
  timeline(tick) {
    if (this.animation.native.seek(tick)) return;
    this.clear();
    this.animation.seek(tick);
    this.integrate(tick, true);
    this.style();
  }
  /**
   * Integrates particle
   * @param {number} tick
   * @param {boolean=} clamp
   */
  integrate(tick, clamp3) {
    this.clock ??= tick;
    let delta = tick - this.clock;
    if (delta) {
      if (clamp3) {
        delta = Math.max(-16, Math.min(16, delta));
      }
      this.clock = tick;
      delta *= 1e-3;
      const body = (
        /** @type {PhysicsBody} */
        /** @type {unknown} */
        this
      );
      Constant.call(null, body);
      if (this.edge) {
        Edge.call(
          null,
          body,
          Vector.set(this.edge.min),
          Vector.set(this.edge.max),
          this.edge.bounce
        );
      }
      Verlet.call(null, body, delta, 1 - this.viscosity);
      if (this.edge) {
        Edge.call(
          null,
          body,
          Vector.set(this.edge.min),
          Vector.set(this.edge.max),
          this.edge.bounce
        );
      }
    }
  }
  /**
   * @return {ReturnType<Item['css']>}
   */
  css() {
    throw new Error("CSS is nor supported for physics");
  }
  /**
   * Gets particle matrix
   * @returns {number[]}
   */
  matrix() {
    const state = (
      /** @type {{ rotate: number[], scale: number[] }} */
      this.state
    );
    return Matrix.compose(this.current.position, state.rotate, state.scale);
  }
};

// src/world.js
var World = class extends EventEmitter {
  /**
   * Creates new world and start frame loop
   * @constructor
   */
  constructor() {
    super();
    this.items = [];
    this.frame = null;
    this.run();
  }
  /**
   * Starts new frame loop
   */
  run() {
    const self = this;
    this.frame = requestAnimationFrame(update);
    function update(tick) {
      if (fixTick) {
        tick = performance.now();
      }
      self.update(tick);
      self.frame = requestAnimationFrame(update);
    }
  }
  /**
   * Update the World on frame
   * @param {number} tick
   */
  update(tick) {
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].update(tick);
    }
  }
  /**
   * Adds node to the animated world
   * @param {HTMLElement} node
  * @param {number|{mass?: number, viscosity?: number, edge?: {min?: Array<number>, max?: Array<number>, bounce?: boolean}, physics?: string}=} mass
   * @param {number=} viscosity
  * @param {{min?: Array<number>, max?: Array<number>, bounce?: boolean}=} edge
   * @return {Item | Particle}
   */
  add(node, mass, viscosity, edge) {
    let item;
    if (mass) {
      item = new Particle(node, mass, viscosity, edge);
    } else {
      item = new Item(node);
    }
    this.items.push(item);
    return item;
  }
  /**
   * Cancels next frame
   */
  cancel() {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
    }
    this.frame = 0;
  }
  /**
   * Stops the World
   */
  stop() {
    this.cancel();
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].stop();
    }
  }
  /**
   * Pauses all animations
   */
  pause() {
    this.cancel();
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].pause();
    }
  }
  /**
   * Resumes all animations
   */
  resume() {
    for (let i = 0; i < this.items.length; ++i) {
      this.items[i].resume();
    }
    this.run();
  }
};

// src/timeline.js
var Timeline = class extends World {
  /**
   * Creates new Timeline and start frame loop
   * @constructor
   */
  constructor() {
    super();
    this.running = false;
    this.currentTime = 0;
    this.start = 0;
    this.changed = 0;
  }
  /**
   * Starts new frame loop
   */
  run() {
    this.frame = requestAnimationFrame(update);
    const self = this;
    function update(tick) {
      if (fixTick) {
        tick = performance.now();
      }
      if (self.running) {
        self.currentTime = tick - self.start;
      }
      self.update(self.currentTime);
      self.frame = requestAnimationFrame(update);
    }
  }
  /**
   * Updates Items in Timeline
   * @param {number} tick
   * @fires Timeline#update
   */
  update(tick) {
    for (let i = 0, length = this.items.length; i < length; ++i) {
      const item = this.items[i];
      if (this.changed < length || this.running) {
        item.timeline(tick);
        this.changed++;
        this.emit("update", tick);
      } else if (!item.animation.native.handlesPlayback()) {
        item.style();
      }
    }
  }
  /**
   * Adds node to the timeline
   * @param {HTMLElement} node
   * @param {number|{mass?: number, viscosity?: number, edge?: {min?: Array<number>, max?: Array<number>, bounce?: boolean}, physics?: string}=} mass
   * @param {number=} viscosity
   * @param {{min?: Array<number>, max?: Array<number>, bounce?: boolean}=} edge
   * @returns {import("./item.js").Item|import("./physics/particle.js").Particle}
   */
  add(node, mass, viscosity, edge) {
    const item = super.add(node, mass, viscosity, edge);
    item.timelineControlled = true;
    return item;
  }
  /**
   * Plays/Resumes Timeline
   */
  play() {
    this.running = true;
    this.start = performance.now() - this.currentTime;
  }
  /**
   * Pauses Timeline
   */
  pause() {
    this.running = false;
  }
  /**
   * Stops Timeline
   */
  stop() {
    this.currentTime = 0;
    this.running = false;
    this.changed = 0;
  }
  /**
   * Sets Timeline time
   * @param {number} time
   */
  seek(time) {
    this.changed = 0;
    this.currentTime = time;
  }
};

// src/core.js
var core_default = {
  /**
   * Creates and initializes world with frame loop
  * @returns {World}
   */
  world() {
    return new World();
  },
  /**
   * Creates and initializes timeline
  * @returns {Timeline}
   */
  timeline() {
    return new Timeline();
  }
};
export {
  core_default as default
};
