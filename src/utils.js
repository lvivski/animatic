/**
 * Vendor specific stuff
 */

var _requestAnimationFrame = window.requestAnimationFrame,
    _cancelAnimationFrame = window.cancelAnimationFrame

for (var i = 0, vendors = ['webkit', 'Moz', 'O', 'ms'], vendor;
     i < vendors.length && !_requestAnimationFrame; ++i) {
  vendor = vendors[i]
  _requestAnimationFrame = window[vendor.toLowerCase() + 'RequestAnimationFrame']
  _cancelAnimationFrame = window[vendor.toLowerCase() + 'CancelAnimationFrame']
                || window[vendor.toLowerCase() + 'CancelRequestAnimationFrame']
}

if (window.chrome && !vendor) {// Chrome supports rAF without prefix, but css properties only with "-webkit-"
  vendor = vendors[0]
}

var _vendor = vendor ? '-' + vendor.toLowerCase() + '-' : '',
    _transformProperty = getProperty('transform'),
    _animationProperty = getProperty('animation')

function getProperty(name) {
  return vendor ? vendor + name[0].toUpperCase() + name.substr(1) : name
}
