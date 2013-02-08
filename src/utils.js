/**
 * Vendor specific stuff
 */
!function(){
  var vendors = ['webkit', 'Moz', 'O', 'ms'], i = 0;

  while(!window.requestAnimationFrame && i < vendors.length) {
    var vendor = vendors[i++].toLowerCase()
    window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame']
    window.cancelAnimationFrame = window[vendor + 'CancelAnimationFrame']
                        || window[vendor + 'CancelRequestAnimationFrame']
  }
  
  vendor || (vendor = vendors[0]) // Chrome supports rAF without prefix, but css properties only with "-webkit"

  window.vendor = vendor ? '-' + vendor + '-' : ''

  window.transformProperty = getProperty('transform')

  window.animationProperty = getProperty('animation')

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
}()
