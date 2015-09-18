function Tween(start, end, property) {
	var type = Tween.propTypes[property] || Tween.NUMERIC
	this.type = type

	this.start = Tween.parseValue(start, type)
	this.end = Tween.parseValue(end, type)
	
	this.suffix = Tween.px.indexOf(property) !== -1 ? 'px' : ''
	if (this.suffix) {
		this.start && (this.start = this.start[0])
		this.end && (this.end = this.end[0])
	}
}

Tween.NUMERIC = 'NUMERIC'
Tween.COLOR = 'COLOR'

Tween.propTypes = {
	color: Tween.COLOR,
	backgroundColor: Tween.COLOR,
	borderColor: Tween.COLOR
}

Tween.px = '\
margin,marginTop,marginLeft,marginBottom,marginRight,\
padding,paddingTop,paddingLeft,paddingBottom,paddingRight,\
top,left,bottom,right,\
width,height,maxWidth,maxHeight,minWidth,minHeight,\
borderRadius,borderWidth'.split(',')

Tween.parseValue = function (value, type) {
	return type === Tween.COLOR ? Tween.parseColor(value) : Tween.parseNumeric(value)
}

Tween.parseNumeric = function (numeric) {
	if (!Array.isArray(numeric)) {
		numeric = String(numeric).split(/\s+/)
	}
	return Array.isArray(numeric) ? numeric.map(parseFloat) : numeric
}

Tween.parseColor = function (color) {
	var hex = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
	if (hex) {
		return {
			r: parseInt(hex[1], 16),
			g: parseInt(hex[2], 16),
			b: parseInt(hex[3], 16),
			a: 1
		}
	}

	var rgb = color.match(/^rgba?\(([0-9.]*), ?([0-9.]*), ?([0-9.]*)(?:, ?([0-9.]*))?\)$/)
	if (rgb) {
		return {
			r: parseFloat(rgb[1]),
			g: parseFloat(rgb[2]),
			b: parseFloat(rgb[3]),
			a: parseFloat(rgb[4] != null ? rgb[4] : 1)
		}
	}
}

Tween.prototype.interpolate = function (state, percent) {
	if (this.type === Tween.NUMERIC) {
		if (Array.isArray(this.start)) {
			for (var i = 0; i < 3; ++i) {
				if (this.end && this.end[i]) {
					state[i] = this.start[i] + this.end[i] * percent
					if (this.suffix) {
						state[i] += this.suffix
					}
				}
			}
		} else if (this.end !== undefined) {
			state = this.start + (this.end - this.start) * percent
			if (this.suffix) {
				state += this.suffix
			}
		}
	} else if (this.type === Tween.COLOR) {
		var rgb = {r:0,g:0,b:0}
		for (var spectra in rgb) {
			var value = Math.round(this.start[spectra] + (this.end[spectra] - this.start[spectra]) * percent)
			rgb[spectra] = clamp(value, 0, 255)
		}
		spectra = 'a'
		value = Math.round(this.start[spectra] + (this.end[spectra] - this.start[spectra]) * percent)
		rgb[spectra] = clamp(value, 0, 1)
		state = 'rgba(' + [rgb.r, rgb.g, rgb.b, rgb.a] + ')'
	}
	return state
}

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}


