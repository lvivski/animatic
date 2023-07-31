export class Tween {
  constructor(start, end, property) {
    const type = Tween.propTypes[property] || Tween.NUMERIC
    this.type = type

    this.start = Tween.parseValue(start, type)
    this.end = Tween.parseValue(end, type)

    this.suffix = Tween.px.indexOf(property) !== -1 ? 'px' : ''
  }

  static NUMERIC = 'NUMERIC'
  static COLOR = 'COLOR'

  static propTypes = {
    color: Tween.COLOR,
    backgroundColor: Tween.COLOR,
    borderColor: Tween.COLOR
  }

  static px = '\
margin,marginTop,marginLeft,marginBottom,marginRight,\
padding,paddingTop,paddingLeft,paddingBottom,paddingRight,\
top,left,bottom,right,\
width,height,maxWidth,maxHeight,minWidth,minHeight,\
borderRadius,borderWidth'.split(',')

  static parseValue(value, type) {
    return type === Tween.COLOR ? Tween.parseColor(value) : Tween.parseNumeric(value)
  }

  static parseNumeric(numeric) {
    if (!Array.isArray(numeric)) {
      numeric = String(numeric).split(/\s+/)
    }
    return Array.isArray(numeric) ? numeric.map(parseFloat) : Number(numeric)
  }

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

    const rgb = color.match(/^rgba?\(([0-9.]*), ?([0-9.]*), ?([0-9.]*)(?:, ?([0-9.]*))?\)$/)
    if (rgb) {
      return {
        r: parseFloat(rgb[1]),
        g: parseFloat(rgb[2]),
        b: parseFloat(rgb[3]),
        a: parseFloat(rgb[4] != null ? rgb[4] : 1)
      }
    }
  }

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

  array(percent) {
    const value = []
    if (Array.isArray(this.end)) {
      for (let i = 0; i < this.end.length; ++i) {
        if (this.end[i]) {
          value[i] = this.start[i] + this.end[i] * percent
          if (this.suffix) {
            value[i] += this.suffix
          }
        }
      }
    }
    return value
  }

  absolute(percent) {
    let value = Number(this.start) + (Number(this.end) - Number(this.start)) * percent
    if (this.suffix) {
      value += this.suffix
    }
    return value
  }

  color(percent) {
    const rgb = { r: 0, g: 0, b: 0 }
    let spectra, value
    for (spectra in rgb) {
      const value = Math.round(this.start[spectra] + (this.end[spectra] - this.start[spectra]) * percent)
      rgb[spectra] = clamp(value, 0, 255)
    }
    spectra = 'a'
    value = Math.round(this.start[spectra] + (this.end[spectra] - this.start[spectra]) * percent)
    rgb[spectra] = clamp(value, 0, 1)
    return 'rgba(' + [rgb.r, rgb.g, rgb.b, rgb.a] + ')'
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}


