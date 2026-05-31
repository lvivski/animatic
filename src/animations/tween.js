/** @typedef {{r: number, g: number, b: number, a: number}} TweenColor */
/** @typedef {number|Array<number|string>|TweenColor|undefined} TweenValue */

export class Tween {
  /**
   * @param {Array<number|string>|number|string|undefined} start
   * @param {Array<number|string>|number|string|undefined} end
   * @param {string} property
   */
  constructor(start, end, property) {
    const type = Tween.propTypes[property] || Tween.NUMERIC
    this.type = type

    /** @type {TweenValue} */
    this.start = Tween.parseValue(start, type)
    /** @type {TweenValue} */
    this.end = Tween.parseValue(end, type)

    this.suffix = Tween.px.indexOf(property) !== -1 ? "px" : ""
  }

  static NUMERIC = "NUMERIC"
  static COLOR = "COLOR"

  /** @type {Record<string, string>} */
  static propTypes = {
    color: Tween.COLOR,
    backgroundColor: Tween.COLOR,
    borderColor: Tween.COLOR
  }

  static px = "\
margin,marginTop,marginLeft,marginBottom,marginRight,\
padding,paddingTop,paddingLeft,paddingBottom,paddingRight,\
top,left,bottom,right,\
width,height,maxWidth,maxHeight,minWidth,minHeight,\
borderRadius,borderWidth".split(",")

  /**
   * @param {Array<number|string>|number|string|undefined} value
   * @param {string} type
   * @returns {TweenValue}
   */
  static parseValue(value, type) {
    return type === Tween.COLOR
      ? Tween.parseColor(value)
      : Tween.parseNumeric(value)
  }

  /**
   * @param {Array<number|string>|number|string|undefined} numeric
   * @returns {number|Array<number>}
   */
  static parseNumeric(numeric) {
    if (!Array.isArray(numeric)) {
      numeric = String(numeric).split(/\s+/)
    }
    return Array.isArray(numeric) ? numeric.map(parseFloat) : Number(numeric)
  }

  /**
   * @param {string} color
   * @returns {TweenColor|undefined}
   */
  static parseColor(color) {
    const hex = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (hex) {
      return {
        r: parseInt(hex[1], 16),
        g: parseInt(hex[2], 16),
        b: parseInt(hex[3], 16),
        a: 1
      }
    }

    const rgb = color.match(
      /^rgba?\(([0-9.]*), ?([0-9.]*), ?([0-9.]*)(?:, ?([0-9.]*))?\)$/
    )
    if (rgb) {
      return {
        r: parseFloat(rgb[1]),
        g: parseFloat(rgb[2]),
        b: parseFloat(rgb[3]),
        a: parseFloat(rgb[4] != null ? rgb[4] : 1)
      }
    }
  }

  /**
   * @param {number} percent
   * @returns {TweenValue|string}
   */
  interpolate(percent) {
    if (this.type === Tween.NUMERIC) {
      if (Array.isArray(this.end)) {
        return this.array(percent)
      } else if (this.end !== undefined) {
        return this.absolute(percent)
      }
    } else if (this.type === Tween.COLOR) {
      return this.color(percent)
    }
  }

  /**
   * @param {number} percent
   * @returns {Array<number|string>}
   */
  array(percent) {
    const value = []
    const start = /** @type {Array<number>} */ (this.start)
    const end = /** @type {Array<number>} */ (this.end)
    if (Array.isArray(end)) {
      for (let i = 0; i < end.length; ++i) {
        if (end[i] !== undefined) {
          value[i] = start[i] + end[i] * percent
          if (this.suffix) {
            value[i] += this.suffix
          }
        }
      }
    }
    return value
  }

  /**
   * @param {number} percent
   * @returns {number|string}
   */
  absolute(percent) {
    /** @type {number | string} */
    let value =
      Number(this.start) + (Number(this.end) - Number(this.start)) * percent
    if (this.suffix) {
      value = value + this.suffix
    }
    return value
  }

  /**
   * @param {number} percent
   * @returns {string}
   */
  color(percent) {
    const rgb = { r: 0, g: 0, b: 0 }
    let spectra, value
    const start = /** @type {TweenColor} */ (this.start)
    const end = /** @type {TweenColor} */ (this.end)
    for (spectra in rgb) {
      const value = Math.round(
        start[spectra] + (end[spectra] - start[spectra]) * percent
      )
      rgb[spectra] = clamp(value, 0, 255)
    }
    spectra = "a"
    value = Math.round(
      start[spectra] + (end[spectra] - start[spectra]) * percent
    )
    rgb[spectra] = clamp(value, 0, 1)
    return "rgba(" + [rgb.r, rgb.g, rgb.b, rgb.a] + ")"
  }
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
