/**
 * Vendor specific stuff
 */

var vendors = ['webkit', 'Moz', 'O', 'ms'], i = 0,

_requestAnimationFrame = window.requestAnimationFrame,
_cancelAnimationFrame = window.cancelAnimationFrame

while(!_requestAnimationFrame && i < vendors.length) {
  var vendor = vendors[i++].toLowerCase()
  _requestAnimationFrame = window[vendor + 'RequestAnimationFrame']
  _cancelAnimationFrame = window[vendor + 'CancelAnimationFrame']
                || window[vendor + 'CancelRequestAnimationFrame']
}

if (window.chrome && !vendor) // Chrome supports rAF without prefix, but css properties only with "-webkit-"
  vendor = vendors[0]

var _vendor = vendor ? '-' + vendor + '-' : '',

_transformProperty = getProperty('transform'),

_animationProperty = getProperty('animation'),

_transitionProperty = getProperty('transition')

function getProperty(property) {
  var style = document.createElement('div').style,
      Property = property[0].toUpperCase() + property.slice(1)
  if (typeof style.transform === 'undefined') {
    return vendors.filter(function(vendor){
      return typeof style[vendor + Property] !== 'undefined'
    })[0] + Property
  } else {
    return property
  }
}
